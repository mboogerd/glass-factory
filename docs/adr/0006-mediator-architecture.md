# Mediator architecture

The mediator is the only component that must be written (MILESTONES.md, "the
mediator"). It tails session logs, is the single append point per session,
enforces capability grants, routes deliveries per delivery policy, and owns
live agent sessions. This record fixes its internals: the shape of the
program, and how each kernel law becomes a property a test can fail.

The load-bearing decision is that these are **one process, not four
services**. Two facts force it. The Claude Agent SDK only lets the process
holding a `query()` handle interject into that session (research/claude-agent-sdk.md
§2), so whoever routes an `address` must be whoever owns the target session.
And per-session sequencing (ADR 0001) is only cheap while the writer for a
session is one in-memory lane; distributing it buys consensus problems M0
does not have. Splitting later is a refactor; starting split is a protocol.

## The pipeline

Every append — from a `gf` client, from an agent's tool call, from the
mediator's own delivery of an `address` — enters one path:

```
admit → validate → authorize → sequence → persist → fan out → route
```

- **admit** — the request names a session; the mediator resolves it to that
  session's writer lane. Lanes are independent: appends to two sessions never
  serialize against each other, appends to one always do (ADR 0001).
- **validate** — envelope plus closed body schema (GRAMMAR.md, ADR 0005).
  A malformed event is rejected here and never reaches the log.
- **authorize** — mutate is checked on append, query on fan-out (ADR 0003).
  Refusal names the missing grant (LIBRARY.md), because a boundary that is
  not stated is not glass.
- **sequence** — the lane assigns `seq` and stamps `ts`. This is the only
  place either is written; `seq` is gap-free per session, `ts` is
  informational and orders nothing.
- **persist** — append one line to the session's JSONL, `fsync` before the
  append is acknowledged. An acknowledged event is a durable event.
- **fan out** — the hot path: push the event to each subscriber whose
  capability admits it, filtered per subscriber, not per event.
- **route** — the event's delivery consequences (below).

The stages are ordered by what they can refuse. Nothing that reaches
**persist** may be rejected, which is what makes law 1 checkable: the log is
the complete record of admitted effects, not a summary of them.

## Delivery routing

`address` is the only verb with a routing consequence in M0 (law 5). The
recipient's delivery policy selects one of three actions, which map directly
onto the SDK:

| Action | Mediator does | Log effect |
|---|---|---|
| notify | nothing further | the delivered event, `cause` → the original |
| spawn | new `query()` with a curated prompt and attenuated options | `spawn` event, then the child's own session log |
| interject | yield an `SDKUserMessage` into the live session's input generator | the delivered event on the target's log |

One `address` produces two log lines — the original on the sender's log and
the delivery on the recipient's, `cause` pointing back (GRAMMAR.md,
"Verbs"). The delivery is an event, so an undelivered address is visible as
a missing line rather than as silence.

The policy *format* is glass-factory-v4l.12; this record fixes only that
routing consumes a policy per recipient and that its three outcomes are
these.

## Agent sessions

An agent is an SDK session the mediator holds open. Two rules keep the glass
intact:

- **Hooks are the bridge, not the prompt.** `PreToolUse`/`PostToolUse` are
  the audit tap that puts an agent's effects on the session log. Asking an
  agent to log its own actions makes law 1 advisory.
- **Never run a parent session in `bypassPermissions` or `acceptEdits`** — it
  overrides per-subagent narrowing (research/claude-agent-sdk.md §3), which
  silently converts an attenuated capability into a full one.

Mid-turn state dies with the process; sessions are rebuilt by `resume` on
restart. That is acceptable at M0 and should be stated in the log rather than
hidden: a restart is an event.

## Each law as a testable property

The point of one program is that the kernel stops being prose.

| Law | Property under test |
|---|---|
| 1 — every effect is an event | replay of the logs reconstructs current state exactly; every acknowledged append is on disk; no state-mutating path bypasses **persist** |
| 2 — observable, filtered only by capability, observation is an effect | two subscribers with equal grants receive identical events; a grant added mid-session changes the filter, not the log; an observation appends (`observe`, reserved — glass-factory-v4l.6) |
| 3 — every interaction is within a scope | `open` at seq 0 carries the origin scope; access is the union of attached scopes; attach widens and detach narrows, both as events |
| 4 — projections are salience-ordered | not a mediator property — it binds interfaces. The mediator's obligation is to expose enough for ordering (cause chains, actor, verb) and to impose none |
| 5 — addressing is subject to the recipient's grants | an `address` to an actor granting no such capability is refused, and the refusal names the missing grant; an admitted one produces exactly two log lines |
| 6 — a text-linear projection always exists | every persisted event renders (closed verbs × closed bodies × one rule each, ADR 0005) — already mechanical |

Law 4 is deliberately not the mediator's to satisfy. A daemon that ordered
events for human attention would be making an interface decision on behalf
of every interface.

## Considered options

- **Separate relay, router, and agent supervisor processes** — rejected: the
  SDK's in-process interjection constraint would force the router and the
  supervisor back together anyway, and a distributed append point needs
  consensus to preserve law 1's per-session order. The upgrade path stays
  available; MILESTONES.md already names it.
- **Sequencing globally rather than per session** — rejected by ADR 0001;
  restated here because the pipeline is where it would creep back in.
- **Enforcing capabilities in the client** — rejected: a client is a
  projection, and law 2 makes the boundary itself visible. Enforcement in a
  projection is enforcement an actor can decline.

## Consequences

- The mediator is a single point of failure for the hot path and, by
  MILESTONES.md, deliberately not an authority: the logs are in git, and
  anyone can clone and start their own. Availability is traded for
  simplicity; correctness is not.
- Hot/cold path split, offline monk-mode drafts, and reconnection sequencing
  are glass-factory-v4l.11's; this record fixes the seam it attaches to
  (**persist** is the hot path's boundary, and the cold path is a periodic
  commit of already-sequenced logs — it never re-sequences).
- The skeleton buildable from this record is admit/validate/sequence/persist
  (glass-factory-64g). authorize, fan out, and route land on top of it as
  M0 steps 2–4, each a stage, not a rewrite.
