# Glass factory standard library

The kernel (KERNEL.md) defines what cannot be derived. The library names what
everyone will need anyway: canonical constructs derived from the kernel,
defined once so every interface renders them consistently. Library entries
are primary citizens of the vocabulary, not the kernel — adding an entry
requires a derivation, not an amendment.

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
notification. For an agent: a new scope (session) or an interjection into an
existing scope. Actor symmetry holds — humans and agents differ only in
their default policy, not in kind.

## Session

One actor's continuous participation in one scope: an enactment of an
identity. Humans hold at most one active session (the seriality constraint);
AI actors hold arbitrarily many, concurrently, with no super-session — the
log integrates them into one actor (law 1). Delivery policies route into
sessions: notify (queue for the serial actor), spawn (new session), or
interject (into an existing one).

## Sub-agent

An actor spawned by a parent actor, holding an attenuated subset of the
parent's capabilities (delegation narrows, never widens) and a curated
context slice chosen by the parent. Context limitation is a feature, not
only a safeguard: a sub-agent functions better on the slice it needs. Its
events are its own, attributable up the spawn chain. Only partitionable
actors (AI) can spawn sub-agents; the human equivalent is capability
filtering, which bounds access but not identity.

## Scope configurations

- **Monk mode** — a scope with no ingress grants; presence optionally
  invisible.
- **Meeting** — a shared scope with an explicit floor: one speaker at a
  time, a visible request-to-speak queue, floor handoff as an event.
- **Department** — a scope whose internal actors grant addressing only by
  capability, with a manager agent as its door. Observable by all (law 2);
  conversable by the credentialed.
