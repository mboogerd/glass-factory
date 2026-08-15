# Glass factory

Vocabulary for the glass factory. KERNEL.md defines the entities and laws;
LIBRARY.md defines canonical derived constructs. This glossary pins terms
that live in neither, and disambiguations that keep conversation sharp.

## Language

**Session**:
A bounded episode of interaction owning exactly one totally-ordered
append-only log. The unit of log: total order exists within a session,
never globally; the factory is a pure function of the session logs. Not an
actor's participation (dropped meaning) — actors participate *in* sessions,
and participation is visible as join/leave events on the session log.
_Avoid_: conversation, thread, channel

**Group**:
An artifact naming a set of actors, usable as a capability target: granting
to the group grants to its members. Membership changes are events.
_Avoid_: team, role

**Context slice**:
One actor's input side — what can enter its working context. Composed of
pushed and reachable context; derived from capabilities plus a curator's
choices. Distinct from scope, which is the interaction side: who is party,
where your events land.
_Avoid_: memory, workspace, private scope (for this concept)

**Pushed context**:
The part of a context slice forced into an actor's working context; the
actor will see it. For an agent, what the curator writes into its prompt.
_Avoid_: pinned context, briefing

**Reachable context**:
The part of a context slice an actor may fetch on demand, held by a
query-only capability. Unfetched until asked for.
_Avoid_: accessible context

**Cause**:
An event's single optional reference to the event that caused it, named by
that event's identity (session, position in log). The only mechanism that
orders events across sessions; timestamps order nothing. Response routing
walks the cause chain — the cited event names its actor.
_Avoid_: in-reply-to, correlation id, parent event

**Verb**:
The kernel-semantic action of an event, drawn from a closed vocabulary
governed like the kernel: a verb exists only because a law or library
construct must recognize it. Domain meaning lives in the payload, never in
the verb. Open or namespaced vocabularies may exist above the kernel, not
in it.
_Avoid_: event type, action name

**Grant**:
A capability change — giving or revoking a handle — recorded as an event
like any other; the current capability table is derived state, a fold over
grant events across the logs. The kernel does not constrain which session a
grant lands on: separating governance from content (e.g. a governance
session per scope) is a convention a deployment may adopt, never a law.
_Avoid_: permission record, ACL entry

**Walled context**:
Everything outside an actor's slice. Walling is the absence of a grant —
there is no deny-list mechanism. Visible as a boundary per law 2, announced
per M0's capability-boundary requirement.
_Avoid_: prohibited context, blocked context
