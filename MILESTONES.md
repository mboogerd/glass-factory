# Milestones

## M0 — The text-linear projection

The simplest possible interface, accessible to all: the deaf and the blind,
the seeing and the hearing. Per kernel law 6, this projection is not a
degraded mode — it is the reference interface.

Text is the one medium that reaches everyone: readable by the deaf, spoken
aloud or rendered in braille for the blind, and machine-readable by agents.
Voice, canvases, and buildings are richer projections layered on top later,
each conformance-tested against what M0 already renders.

Done when a single text-linear interface renders all five entities and
violates none of the six laws:

- **Actor** — humans and at least one real agent are present and addressable.
- **Event** — the append-only log exists and every effect lands on it,
  including observation itself (law 2) and addressing (law 5).
- **Artifact** — the factory's own definition (this repo) is readable and
  modifiable through the interface; the factory builds itself from day one.
- **Scope** — at least monk mode (private) and one shared scope work, and
  entering/leaving a scope is itself an event.
- **Capability** — query-only and mutate handles both exist and are enforced;
  the boundary is visible, not silent.

Plus law 1's dividend as the acceptance test: the interface can replay the
log from the founding to now — time travel works in plain text before any
building is drawn.

### The intersection set

From the deaf and blind interaction-pattern studies (see research/): both
communities' universal patterns converge on one principle — **everything is
modality-independent, queryable, logged state**. M0 implements:

1. **Canonical transcript** — the event log is the conversation: persistent,
   speaker-attributed, replayable. Time travel is transcript replay.
2. **Terse, front-loaded event grammar** — actor–verb–object first, metadata
   after. Serves braille lines, visual skimming, and agent parsing alike.
3. **Summary-first drill-down** — every collection announces count and gist
   before contents ("build-dept: 14 events/min, 3 actors active — expand?").
4. **Interrogation over inspection** — the dependency graph is navigated by
   asking nodes ("agent X: depends on 3, depended on by 7"), not by reading
   diagrams. The agent-as-historian is the accessible graph.
5. **Search-first jump** to any actor, artifact, or scope; full keyboard
   operability with consistent commands.
6. **Explicit presence** — scope roster announced on entry, join/leave as
   events, a "who's here" query. Reciprocal glass (law 2) makes being
   watched perceivable in any modality.
7. **Explicit floor** — one speaker per scope at a time, a visible
   request-to-speak queue, floor handoff as an event. Deaf turn-taking
   discipline, which also makes conversation linearizable for screen readers
   and parseable for agents.
8. **Tiered, rate-limited salience** — distinct urgency classes, an
   on-demand digest, interruption only by capability grant (law 5). No
   single undifferentiated "notification."
9. **Capability boundaries stated in text** — "query-only handle" announced
   up front, never conveyed only by styling or by who deigns to answer.

The communities diverge only on the *channel* of ambient awareness — earcons
and spatial audio for the blind, peripheral glow and motion for the deaf —
and both channels derive from the same salience-ordered event stream. Channel
rendering is therefore projection-layer work (M1+), not M0.

## Path to MVP — M0 is the MVP

The substrate is a git repo: events as append-only JSONL inside it. Git
provides history (law 1), replay (time travel), sync (multi-human),
signatures (attribution), and forkability (exit stays cheap). Agents are
Claude Agent SDK sessions; sub-agents with curated context are native there.
The interface is a CLI (`gf say / log / replay / who / ask`) — law 6 and the
intersection set nearly by construction.

The only component that must be written is the **mediator**: a daemon that
tails the log, enforces capability grants, routes deliveries per delivery
policy (notify / spawn / interject), and spawns agent sessions. Every kernel
law becomes a testable property of this one program.

### Sync — one log, two temperatures

Law 1 requires a total order over events, which git cannot give concurrent
writers. So the mediator, run centrally, is also the **relay**: the single
append point that sequences events, enforces capabilities, and fans them out
to subscribers over a push channel (SSE/WebSocket) — the subscription
construct realized in transport. Presence, floor, and reciprocal observation
ride this hot path at sub-second latency. The relay periodically commits the
sequenced log to git — the cold path: archival, replay, signed attribution,
and forkability. The relay is a convenience, never an authority: anyone can
clone the repo and start their own relay, so exit stays cheap. Offline,
clients read their local replica and draft in monk mode (private scopes need
no total order); reconnection submits drafts for sequencing. Distributed
consensus is the upgrade path if one relay is ever outgrown, not the start.

Sequence, self-hosted from day one (the factory's first project is itself):

1. Log + event grammar + CLI. Acceptance: replay from founding to now.
2. First agent behind a door (subscription + delivery policy). Acceptance:
   the agent modifies the factory's own definition via the log.
3. Capabilities (query-only vs mutate) and scopes (monk mode + one shared);
   observation logged — reciprocal glass works.
4. Second human via the relay's push channel; git carries the cold path.
   Floor and presence patterns activate.
5. MVP test: build the factory's next feature entirely inside the factory —
   ≥2 humans, ≥2 agents, everything on the log. Pass = participants prefer
   it to Slack + GitHub for that week. Then M1 (voice) layers on top.

## Later

- M1 — voice in, projections out: one room, one real agent, real repo work;
  measure repair rate and keyboard-fallback rate (the riskiest-assumption
  study from the UX evaluation).
- M2 — reciprocal-glass social study: one works, one observes, observation
  visibly logged; debrief on how being watched felt.
