---
name: work
description: Runs one unattended work session on the glass-factory beads backlog — sync, select, claim one item, implement, gate, close, publish. Use when a cron job or scheduled work slot fires, or the user says "/work", "work the queue", or wants autonomous progress on glass-factory beads.
---

# /work — one session, one item at a time

Loop: sync → select → claim → implement → verify → close → publish.
Repeat while budget remains; stop cleanly when it does not.

## 0. Setup

- Work from the repo root. `bd dolt pull`. Pull failure: stop, report the error verbatim.
- Budget: the slot's stated time, else 45 minutes. Never start an item you cannot finish
  and verify in the remainder. Anything released mid-flight gets a progress comment.

## 1. Select

- `bd ready --json`. Pick the highest-priority leaf task completable this slot.
  The M0 build sequence lives under epic `glass-factory-v4l`; build tasks follow
  MILESTONES.md's own order, design beads (`v4l.*`) are doc deliverables in
  `docs/adr/` style.
- Skip: items whose assignee's `updated_at` is fresher than 24h; items naming an
  open human decision.
- Stale claim (in_progress, other assignee, `updated_at` older than 24h): take over,
  say so in a comment.
- Top of ready is an epic/feature with no ready children: run the `breakdown` skill
  on one such parent, then re-select.

## 2. Claim

Bracket it: `bd dolt pull` → `bd show <id>` still unclaimed → `bd update <id> --claim`
→ `bd dolt push`. Push failure means you do not own it: re-pull, re-check.

## 3. Verify premises, then implement

- Read the full bead, its cited MILESTONES.md/GRAMMAR.md/ADR sections, and any design
  bead it depends on. Verify each stated precondition on disk. A false premise:
  comment starting `QUESTION:`, release the claim (status open, assignee cleared),
  select other work. Never build on a false premise; never silently re-scope.
- Smallest diff satisfying the acceptance criterion. No invented scope, no drive-by
  refactors, no TODO files.

## 4. Gate (glass-factory-specific)

- The substrate is locked and not re-litigated in implementation: git repo +
  append-only JSONL events; agents as Claude Agent SDK sessions; `gf` CLI;
  mediator-as-relay.
- If `package.json` exists: `npm test` passes. Until it does, the gate is the
  bead's own acceptance criterion, actually exercised (once `glass-factory-21j`
  lands, replay-from-founding is the standing gate for log-touching work).
- Event logs are append-only. New verbs go through GRAMMAR.md's closed vocabulary
  (ADR 0003) — no ad-hoc verbs from an implementation task.
- KERNEL.md is constitutional: changes only via its own amendment rule, never as a
  side effect of a build task. File a QUESTION instead.

## 5. Close and publish

- `bd close <id>` with a comment: what changed, how verified.
- Git: commit only files your item touched; end the message with
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`; `git push`.
  Push failure: report verbatim, leave committed.
- `bd dolt push`. Loop to 1 or end the session with a one-paragraph summary.

## Non-negotiable

- One claim at a time; close or release before the session ends.
- Never `bd create --parent=<epic you did not create this session>`: create unparented,
  then `bd dep add <child> <parent> --type parent-child`. `blocks` edges task↔task only.
- Never push without pulling first.
- Failing gate = not done. Report it as such.

When a rule seems dispensable, read [references/why.md](references/why.md) first.
