# Glass factory standard library

The kernel (KERNEL.md) defines what cannot be derived. The library names what
everyone will need anyway: canonical constructs derived from the kernel,
defined once so every interface renders them consistently. Library entries
are primary citizens of the vocabulary, not the kernel — adding an entry
requires a derivation, not an amendment.

## Capability grant (M0)

M0's representation of a capability: `{grantee, mode, target, filter?}` —
grantee an actor or group, mode query-only or mutate, target a scope,
artifact, or actor. Per target kind: scope — observe its sessions vs
participate; artifact — read vs modify; actor — law-5 addressing (a door is
`{anyone, mutate, me}`; a subscription adds a filter). The optional filter
conditions the grant on event pattern (origin scope, actor, verb — kept
deliberately tiny); whether a mediator checks it write-side or read-side is
an implementation choice, not pinned here.

Delegation reuses `cause`: a delegated grant event cites the grant it
attenuates, and the effective capability at use time is the intersection
along that chain. "Narrows, never widens" is thus structural, not checked:
revoking an ancestor kills every downstream delegation instantly, and "what
could this actor do at time T" is answerable by walking chains in the log.
Root grants (no ancestor) are issued by the target's governance — in M0,
whoever holds mutate on the scope itself.

Boundaries are announced in text (intersection-set req 9) on three
surfaces: on entry, the presence announcement states your mode ("joined
#build (query-only)"); on refusal, the reply names the missing grant, and
the mediator by default logs a `denied` event citing the attempt via
`cause` (kernel-silent — a denial is no effect — but the glass should
carry watching-the-wall); on demand, the capability table is interrogable
(`who` / `can` queries). This is the first, deliberately crude
representation, not the capability model: the kernel obliges only that
allowed-or-not is answerable, derivable from the logs, and visibly
announced. A richer policy system supersedes this entry, not the kernel.

## Door

Every actor's public entry point: a standing law-5 grant, "anyone may address
me here." Deliveries arrive at the granted priority and are presented
salience-ordered per law 4. The manager agent is a department's door.

## Subscription

Standing consent to be addressed by events: a law-5 grant pre-authorized for
events matching a declared filter. The declaration is an artifact (part of
the factory's definition); each delivery is an event. A subscription is a
*declared attention dependency* — the attention analogue of the declared
dataflow edge, and equally diffable against enacted attention: an actor who
keeps polling what they never subscribed to has worn a desire path.

Door and subscription are mirror images — others reaching in to you, versus
you reaching out for events. Both are standing consent; law 5 covers the
per-contact case, these cover the durable case.

## Delivery policy

The recipient's declared rendering of being addressed, versioned as an
artifact owned by the recipient. For a human: a salience-ordered
notification (queued for the serial actor). For an agent: a new session
spawned, or an interjection into an existing one. Actor symmetry holds —
humans and agents differ only in their default policy, not in kind.

## Context slice

One actor's *input* side: what can enter its working context. **Pushed
context** is forced in — the actor will see it. **Reachable context** may be
fetched on demand, held via query-only capability. Everything else is
**walled** — walling is the absence of a grant, never a deny-list; the
boundary is visible per law 2. A slice is derived from capabilities plus a
curator's choices. Scope governs the interaction side (where events land,
who they reach); the slice governs what comes in.

## Group

An artifact naming a set of actors, usable as a capability target: granting
to the group grants to every member. Membership changes are events. The
"credentialed" of a department are a group.

## Disclosure level

A session's live cap on what may be disclosed into it: the meet (least
privilege) of the current participants' capabilities, recomputed on every
join and leave — each recomputation an event on the session log, so
participants always know what may now be said. A lesser-privileged late
joiner sees no prior history, only the stream from their join point.
Enforcing the cap on content is application-level; the model states only
the rule.

## Sub-agent

An actor spawned by a parent actor, holding an attenuated subset of the
parent's capabilities (delegation narrows, never widens) and a curated
context slice chosen by the parent. The spawner is the default supervisor;
supervision may later be reassignable by event. Context limitation is a
feature, not
only a safeguard: a sub-agent functions better on the slice it needs. Its
events are its own, attributable up the spawn chain. Only partitionable
actors (AI) can spawn sub-agents; the human equivalent is capability
filtering, which bounds access but not identity.

## Scope configurations

- **Monk mode** — a scope with no ingress grants; presence optionally
  invisible.
- **Meeting** — a shared scope whose sessions carry an explicit floor: one
  speaker at a time, a visible request-to-speak queue, floor handoff as an
  event.
- **Department** — a scope whose internal actors grant addressing only by
  capability, with a manager agent as its door. Observable by all (law 2);
  conversable by the credentialed.
