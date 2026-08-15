# Glass factory kernel

Five entities, six laws. Every interface — a 3D building, a voice call with a
projected graph, a 2D canvas, a terminal — is a projection of this model.
An interface is a legitimate glass-factory interface iff it renders all five
entities and violates no law.

## Entities

- **Actor** — a human or an agent. Holds capabilities, participates in scopes,
  produces events. An actor is an *identity*, not an execution: one actor may
  enact many sessions (see LIBRARY.md). Humans carry a seriality constraint —
  at most one active session, everything passing through one consciousness.
  AI actors carry none, and need no orchestrating super-session: law 1 is the
  integrator — unity is one identity's events on one log, achieved by the
  ledger after the fact, not by a coordinator before it. (Law 4 is this
  seriality constraint viewed from the interface side: salience-ordering
  exists because human attention is serial.) The second asymmetry is
  *partitionability*: an AI actor can spawn sub-agents — context-bounded
  sub-identities holding attenuated capabilities and a curated context
  slice. Humans can be denied future access, but never partially exposed:
  their identity is continuous and remembers.
- **Event** — an immutable record of something that happened. The append-only
  log of all events is the single source of truth.
- **Artifact** — a durable product derived from events: code, documents,
  decisions, and the factory's own definition (which is what makes the factory
  self-building).
- **Scope** — a bounded context of interaction: who is party to a
  conversation. Rooms, channels, meetings, and monk mode are renderings of
  scope, not primitives themselves.
- **Capability** — a handle defining what an actor may observe or effect.
  The minimal split is query-only versus mutate.

## Laws

1. **Every effect is an event on the append-only log.**
   The factory at time T is a pure function of the log up to T. Derivation of
   the space and time travel through its history follow from this; they are
   not features.
2. **Every event is observable by every actor, filtered only by capability —
   and observation is itself an effect, hence an event.**
   This is the glass, and it is reciprocal: watching is visible. Opacity
   exists only as an explicit, visible capability boundary — never as a
   default. Glass that reflects only one way is a panopticon.
3. **Every interaction happens within a scope.**
   Monk mode, group meetings, departments and their manager membranes are
   scope configurations, not separate features.
4. **Every projection must be salience-ordered for human attention.**
   The artists' brief. Attention is scarce; an interface that renders
   everything at equal loudness violates the model.
5. **Addressing an actor is a scoped effect, subject to the recipient's
   capability grants.**
   "You may not interrupt me" is a capability, not a mute button. This is the
   difference between an ambient workplace and an open-plan hell.
6. **A text-linear projection of the whole model always exists.**
   Accessible to the deaf and the blind, the seeing and the hearing alike.
   It is simultaneously the reference interface, the conformance baseline,
   the screen-reader story, the API, and the escape hatch when richer
   projections fail.

## Worked derivation: the two dependency graphs

Agent-to-agent interaction needs no new primitive; it lands in two existing
ones, which is why its manifestations differ.

- **Declared dependencies** (the static dataflow graph) live in *artifact*:
  they are authored, versioned structure in the factory's own definition.
  They manifest as architecture — conduits between workstations, a
  "depends on: 3" answer under interrogation.
- **Enacted interactions** (choreography) live in *event*: agents addressing
  agents under law 5, exactly as humans do — actors are symmetric. They
  manifest as activity — transcript lines, the ambient hum, footsteps.

The enacted graph is derivable from the log by aggregation, so the two
graphs can always be diffed. Declared-but-never-enacted is dead wiring (a
dusty pipe). Enacted-but-never-declared is a desire path — a shadow
dependency made visible by construction, which governance can pave into a
declared dependency or forbid via capability. Divergence shrinks through
decisions on the record, never through drift.

## Amendment rule

A concept enters the kernel only if it passes the invariance test: every
dissimilar interface must render it, and it cannot be derived from the
existing primitives. The kernel stays under seven entities and one page.
