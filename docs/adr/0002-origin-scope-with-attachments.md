# Scopes attach to sessions many-to-many, anchored by an origin scope

Scopes are named bundles of access grants; sessions and scopes relate
many-to-many. Every session *originates* in exactly one scope — its
governance anchor, holding attach/detach authority by default — and may
have further scopes attached later. A session's access is the union of its
attached scopes: attaching only ever widens, narrowing is detaching, and
both are events on the session log.

## Considered options

- **One scope per session** (strict containment) — rejected: sharing a
  monk-mode session with a department would mean re-homing or copying the
  transcript mid-life, and audit-style cross-cutting read access would have
  to be edited into every scope's config.
- **Pure many-to-many** — rejected: leaves "who may attach/detach" floating
  as just another capability with no default answer.

Union semantics are safe because capabilities are grants-only (no
deny-list): merging bundles can never contradict.
