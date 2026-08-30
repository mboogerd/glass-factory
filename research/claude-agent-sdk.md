# Claude Agent SDK: integration surface for the mediator

Verified against the official docs at code.claude.com (platform.claude.com redirects
there), August 2026. Package: `@anthropic-ai/claude-agent-sdk` (TypeScript),
`claude-agent-sdk` (Python). Both SDKs bundle the Claude Code binary and drive it as a
subprocess.

## Verdict

The SDK covers all three mediator verbs — **spawn** (each `query()` is a fresh session
with per-session options; `agents`/`AgentDefinition` gives nested sub-agents with
tool-restricted, own-prompt, own-model configs), **interject** (streaming input mode: a
`query()` fed an `AsyncGenerator` is a persistent session that accepts queued mid-run
messages plus `interrupt()`, `setPermissionMode()`, `setModel()` at runtime), and
**attenuate** (a layered enforcement stack: `tools`/`disallowedTools` remove capability
from context entirely, `allowedTools` + `permissionMode: "dontAsk"` gives a closed
allowlist, `PreToolUse` hooks and `canUseTool` give programmatic per-call gating —
enough to enforce query-only vs mutate mechanically, not just by prompt). Sessions are
resumable across process restarts (`resume`, `forkSession`, JSONL transcripts on disk,
pluggable `sessionStore`). The gaps for glass-factory: (1) **interjection requires the
mediator to keep the streaming process alive** — you cannot inject input into a session
another process owns; "interject into an existing scope" therefore means the mediator
holds the streaming `query()` handle, or falls back to resume-with-new-prompt (which is
sequential turns, not true mid-turn interjection); (2) **context curation is by
construction, not subtraction** — a spawned sub-agent starts fresh and gets only the
prompt string + its `AgentDefinition.prompt` (+ CLAUDE.md if setting sources allow), so
the mediator must assemble the context slice itself from the event log, which actually
matches the kernel's "curated context slice" model well; (3) the SDK's transcript is
its own store, separate from the factory's event log — the mediator must bridge (hooks
give the tap: every tool use, subagent start/stop, and stop event is observable); and
(4) capability attenuation is per-session config chosen by the spawning code — the SDK
enforces it once configured, but "delegation narrows, never widens" across a spawn
chain is a mediator invariant to maintain, with one SDK caveat: parent
`bypassPermissions`/`acceptEdits` modes override per-subagent `permissionMode`.

## 1. Long-running / resumable sessions

Source: https://code.claude.com/docs/en/agent-sdk/sessions and
https://code.claude.com/docs/en/agent-sdk/agent-loop

- A session is the accumulated conversation (prompt, tool calls/results, responses),
  written to disk automatically as JSONL under
  `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl` (or `$CLAUDE_CONFIG_DIR`).
- Session ID: read `session_id` from the `ResultMessage` (every result) or the init
  `SystemMessage`. Options: `resume: <sessionId>` (specific session), `continue: true`
  / `continue_conversation=True` (most recent in cwd), `forkSession: true` /
  `fork_session=True` (branch a copy; original untouched), `persistSession: false`
  (TS: in-memory only), `sessionId` (pin a UUID), `resumeSessionAt` (resume at a
  specific message UUID — time travel into a transcript).
- Resuming restores full context (files read, decisions made). Resume works
  cross-directory on the same machine (Claude Code >= v2.1.223); cross-host resume via
  a `sessionStore` / `session_store` adapter that mirrors transcripts to your own
  backend (https://code.claude.com/docs/en/agent-sdk/session-storage), or by moving
  the JSONL file.
- Session enumeration/metadata APIs: `listSessions()`, `getSessionMessages()`,
  `getSessionInfo()`, `renameSession()`, `tagSession()` (snake_case in Python).
- Limits: `maxTurns`, `maxBudgetUsd` end a run with `error_max_turns` /
  `error_max_budget_usd`; you resume with higher limits. Long-running = a chain of
  resumable runs or one long-lived streaming session; the SDK process itself is not a
  daemon you can re-attach to.

## 2. Interjecting into a running session

Source: https://code.claude.com/docs/en/agent-sdk/streaming-vs-single-mode and
https://code.claude.com/docs/en/agent-sdk/typescript

- **Streaming input mode** (the recommended mode): pass an
  `AsyncGenerator<SDKUserMessage>` as `prompt` (TS) or use `ClaudeSDKClient` (Python).
  The session is a persistent process; you can yield new user messages at any time —
  they queue and process sequentially — including image content blocks.
- The returned `Query` object (TS) exposes runtime controls: `interrupt()` (cancels
  the current turn; v2.1.205+ reports which queued messages survive),
  `streamInput(stream)`, `setPermissionMode(mode)`, `setModel(model)`,
  `applyFlagSettings()`, `stopTask(taskId)`, `getContextUsage()`,
  `mcpServerStatus()`, `close()`. Python: `ClaudeSDKClient.query()` again on the same
  client continues the session; `interrupt()` and `set_permission_mode()` exist.
- Single-message mode explicitly does **not** support dynamic message queueing or
  real-time interruption; multi-turn there is resume/continue between calls.
- A streaming session survives error results (stays alive, keeps accepting messages)
  except process crashes.
- Consequence for the mediator: "interject" maps to holding the streaming handle for
  each live agent session and yielding a new `SDKUserMessage` into its generator.
  There is no cross-process "send message to session X" API — the mediator daemon must
  own the sessions it wants to interject into.

## 3. Sub-agents with curated context and attenuated capabilities

Source: https://code.claude.com/docs/en/agent-sdk/subagents

- `agents` option on `query()`: `Record<string, AgentDefinition>`. `AgentDefinition`
  fields: `description` (when to use), `prompt` (own system prompt), `tools`
  (allowlist — an omitted tool is *not in the session at all*), `disallowedTools`
  (incl. `mcp__server__*` patterns), `model` (per-agent override: alias or full ID),
  `permissionMode` (per-agent), `mcpServers` (per-agent MCP servers), `skills`,
  `memory` (`'user' | 'project' | 'local'`), `maxTurns`, `background`, `effort`,
  `initialPrompt`. Filesystem `.claude/agents/*.md` is the alternative; programmatic
  wins on name clash.
- **Context isolation**: a subagent starts with a fresh conversation. It receives only
  its own `AgentDefinition.prompt`, the Agent tool's prompt string from the parent,
  tool definitions, and project CLAUDE.md (if setting sources enabled). It does NOT
  receive the parent's history, tool results, or system prompt. Curated context =
  whatever the spawner puts in the prompt string. Only the subagent's final message
  returns to the parent.
- Invocation: Claude invokes via the `Agent` tool (auto or by explicit mention);
  include `"Agent"` in `allowedTools` to auto-approve. Subagents can nest; caps:
  `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (default 3), `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`
  (default 20) via `env`, and `maxBudgetUsd` covers the whole tree.
- Subagents are resumable: Agent tool result carries `agentId:`; resume the same
  session (`resume: sessionId`) and reference the agent ID. Subagent transcripts are
  separate files; hook inputs carry `agent_id` / `agent_transcript_path`.
- Attenuation caveat: subagents inherit the parent's permission mode; a definition's
  `permissionMode` can override it **except** when the parent runs
  `bypassPermissions`, `acceptEdits`, or `auto` — those propagate and can't be
  narrowed per subagent. So the mediator should never run parent sessions in
  bypass mode if narrowing matters.
- Note: for the mediator's own "spawn a session for actor X", the top-level analogue
  is simply a new `query()` with its own options (tools, prompt, model, cwd, MCP
  servers) — the `agents` mechanism is for delegation *inside* one session. The
  `agent: <name>` option can also run a named definition as the main-thread agent.

## 4. Hooks

Source: https://code.claude.com/docs/en/agent-sdk/hooks (SDK callback hooks; settings
file shell hooks also load via `settingSources`)

- Registered via `options.hooks: { <HookEvent>: [{ matcher?, hooks: [callback], timeout? }] }`.
  Callbacks receive typed input (`session_id`, `cwd`, `hook_event_name`, plus
  event-specific fields like `tool_name`/`tool_input`; `agent_id`/`agent_type` when
  fired inside a subagent) and return a decision object.
- Events (Python + TS unless noted): `PreToolUse`, `PostToolUse`, `PostToolUseFailure`,
  `UserPromptSubmit`, `Stop`, `SubagentStart`, `SubagentStop`, `PreCompact`,
  `PermissionRequest`, `Notification`. TS-only: `SessionStart`, `SessionEnd`,
  `PostToolBatch`, `PostCompact`, `StopFailure`, `MessageDisplay`,
  `UserPromptExpansion`, `PermissionDenied`, `Setup`, `TaskCreated`, `TaskCompleted`,
  `Elicitation`, `ElicitationResult`, `ConfigChange`, `InstructionsLoaded`,
  `WorktreeCreate`/`WorktreeRemove`, `CwdChanged`, `FileChanged`, `DirectoryAdded`,
  `TeammateIdle`.
- What they can do: `PreToolUse` returns
  `hookSpecificOutput.permissionDecision: "allow" | "deny" | "ask" | "defer"` +
  `permissionDecisionReason` + `updatedInput` (rewrite the tool call's arguments);
  `PostToolUse` can add `additionalContext` or replace output via `updatedToolOutput`;
  `UserPromptSubmit` can inject context or block a prompt; top-level `systemMessage`
  (user-visible) and `continue` (stop the agent) on any event. `deny > defer > ask >
  allow` when multiple hooks fire; hooks run in parallel. `{ async: true }` for
  fire-and-forget side effects.
- Hooks run in the host process, outside the model's context window, before every
  other permission step — a hook deny applies even in `bypassPermissions`. This is the
  mediator's tap for law 1 (every tool effect → event on the log) and law 2
  (observation logging), and its hard enforcement point.

## 5. Programmatic context control

Sources: https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts,
https://code.claude.com/docs/en/agent-sdk/agent-loop

- **System prompt**: default is a minimal tool-calling prompt (NOT the Claude Code
  prompt). `systemPrompt` accepts a custom string, or
  `{ type: "preset", preset: "claude_code", append?, excludeDynamicSections? }`.
  Python adds `{"type": "file", "path": ...}`.
- **Filesystem context**: `settingSources: ['user' | 'project' | 'local']` controls
  loading of CLAUDE.md, settings.json permission rules, shell hooks, output styles,
  skills. CLAUDE.md is injected into the conversation (not the system prompt); pass
  `settingSources: []` for a fully code-defined context — the mediator can use this to
  make the curated slice the *only* context.
- **Compaction**: automatic when the context window nears its limit; emits a
  `compact_boundary` system message. Steerable via summary instructions in CLAUDE.md,
  `PreCompact`/`PostCompact` hooks (archive the full transcript before it's
  summarized), and manual `/compact` sent as a prompt string. `getContextUsage()` (TS)
  reports current token usage. There is no SDK option for the API-level
  context-editing feature; compaction is the mechanism.
- **Memory**: CLAUDE.md is the persistent memory surface (re-injected every request,
  survives compaction); `AgentDefinition.memory` selects a memory source per agent.
  Session transcripts + `resume` are episodic memory.
- **Other knobs**: `maxTurns`, `maxBudgetUsd`, `effort`, `thinking`, `model` /
  `fallbackModel`, `outputFormat` (structured output via JSON schema),
  `includePartialMessages` (raw stream events), `enableFileCheckpointing` +
  `rewindFiles()` (file-state time travel, distinct from conversation resume),
  `additionalDirectories`, `cwd`, `env`, `sandbox`, `plugins`.

## 6. Permission / capability enforcement — query-only vs mutate

Sources: https://code.claude.com/docs/en/agent-sdk/permissions,
https://code.claude.com/docs/en/agent-sdk/custom-tools

- **Evaluation order** (fixed): hooks → deny rules → ask rules → permission mode →
  allow rules → `canUseTool` callback. A hook deny or a deny rule blocks even
  `bypassPermissions`.
- **Two layers**: *availability* (is the tool in the model's context at all — `tools`
  option, bare-name `disallowedTools`, subagent `tools` field) vs *permission* (is a
  given call approved — `allowedTools`, scoped rules like `Bash(rm *)`,
  `Edit(//path/**)`, mode, callback). Removing availability is the strongest
  attenuation: the agent can't even attempt the call.
- **`canUseTool`**: async callback invoked for calls no earlier step resolves; returns
  allow (optionally with `updatedInput`) or deny. Caveat: auto-approved tools never
  reach it — for checks that must see every call, use a `PreToolUse` hook.
- **Permission modes**: `default`, `dontAsk` (deny anything not pre-approved; never
  prompts — the right mode for headless factory agents), `acceptEdits`, `plan`,
  `auto` (model-classifier approvals), `bypassPermissions` (TS also requires
  `allowDangerouslySkipPermissions: true`). Runtime switch: `setPermissionMode()`.
- **MCP gating**: MCP tools are named `mcp__<server>__<tool>`; allow/deny rules take
  `mcp__server__*` patterns; per-agent `mcpServers` scopes which servers an agent
  sees at all; `toggleMcpServer()`/`setMcpServers()` at runtime; `strictMcpConfig`
  ignores filesystem `.mcp.json`.
- **Recipe for glass-factory's query-only vs mutate capability handles**: implement
  factory operations as in-process MCP tools (`tool()` + `createSdkMcpServer` /
  `@tool` + `create_sdk_mcp_server`) split into a query server (log read, replay, who,
  ask — `readOnlyHint: true`) and a mutate server (say, artifact write). A query-only
  actor gets `tools: []` or a read-only built-in set, only the query server in
  `mcpServers`, `allowedTools: ["mcp__gf_query__*"]`, and
  `permissionMode: "dontAsk"`; a mutate-capable actor additionally gets the mutate
  server. A `PreToolUse` hook logs every call (and its decision) to the event log —
  observation as effect. Enforcement is then structural (tool absent), declarative
  (deny/allow rules), and programmatic (hook), in that order of strength.

## Mediator design implications

1. The mediator daemon owns live agent sessions as in-process streaming `query()`
   handles. Delivery-policy routing maps directly: **notify** = append event only;
   **spawn** = new `query()` with curated prompt + attenuated options; **interject** =
   yield an `SDKUserMessage` into the target session's input generator (or
   `interrupt()` + message for urgent grants). If the mediator restarts, live
   interjection targets are rebuilt by `resume` — acceptable, but mid-turn state dies
   with the process.
2. Curated context slice = the prompt string the mediator assembles from the event log
   plus `systemPrompt` + `settingSources: []`. Nothing leaks in by default — good.
3. Capability handles = MCP server composition + allowlists + `dontAsk` + PreToolUse
   hook as the audit/enforcement tap. Never run parent sessions in
   `bypassPermissions`/`acceptEdits` or per-subagent narrowing breaks.
4. The SDK transcript store and the factory event log are separate stores; hooks
   (PreToolUse/PostToolUse/SubagentStart/Stop/UserPromptSubmit) are the bridge for
   putting every agent effect on the log.
