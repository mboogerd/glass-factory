# Glass factory event grammar

The law-6 reference artifact: how an event is written down (JSONL) and how
it is spoken (the canonical text line). One record per line; one line per
record. The text line is always derived from the record, never stored —
grammar and schema cannot drift because they are one document: this one.

## Envelope

```json
{"seq": 14, "ts": "2026-08-15T09:12:03Z", "actor": "mira", "verb": "say",
 "cause": {"session": "s-7", "seq": 9}, "body": {"text": "relay is up"}}
```

- **Identity** — `(session, seq)`. The log names the session, so `session`
  is not a field; repeating it per line would be denormalization with a
  contradiction risk. `seq` is relay-assigned at append.
- **`ts`** — relay-stamped, informational only. Timestamps order nothing:
  `seq` orders within a session, `cause` orders across sessions. Events
  with no cause path between them are concurrent.
- **`actor`** — flat opaque id. The spawn chain is derived from `spawn`
  events, not encoded in the identity.
- **`cause`** — single optional `{session, seq}`: the event that caused
  this one. The only cross-session ordering mechanism. Response routing
  walks the chain; the cited event names its actor.
- **`body`** — one object, schema fixed per verb. Closed vocabulary, closed
  bodies: no free-form bag.

## Verbs

The vocabulary is closed and kernel-governed (ADR 0005). Two events get
different verbs iff a different law or library construct fires on them.
Domain meaning lives in the payload of `say`/`produce`, never in the verb.

| Verb | Body | Line | Fires |
|---|---|---|---|
| `open` | `{scope}` | `mira opens session in atelier` | law 3; mandatory at seq 0 — the origin scope is the shape of line zero |
| `close` | `{}` | `mira closes session` | ends the episode; relay refuses further appends |
| `say` | `{text}` | `mira says: relay is up` | ambient speech into the session |
| `address` | `{to, text}` | `mira → fetcher-1: rerun the build` | law 5; checked against the recipient's grants, triggers their delivery policy. Delivery is the same event appended by the relay to the target session, `cause` pointing at the original — one address, two log lines |
| `join` | `{}` | `fetcher-1 joins` | participation; disclosure level recomputes |
| `leave` | `{}` | `fetcher-1 leaves` | participation; disclosure level recomputes |
| `attach` | `{scope}` | `mira attaches audit-scope` | ADR 0002; widens access |
| `detach` | `{scope}` | `mira detaches audit-scope` | ADR 0002; narrows access |
| `grant` | `{grantee, mode, target}` | `mira grants query:spec-v3 to fetcher-1` | capability change; M0 shape per LIBRARY |
| `revoke` | `{grantee, mode, target}` | `mira revokes query:spec-v3 from fetcher-1` | capability change |
| `spawn` | `{child, grants}` | `mira spawns fetcher-1` | sub-agent creation; grants are the attenuated set (context-slice representation pending the capability work) |
| `produce` | `{artifact, hash}` | `mira produces spec-v3 (a41f2c)` | artifact version comes to be; reference is content-addressed, bytes live in the artifact store |
| `observe` | reserved | — | mechanics (whose log, granularity, law-2 rewording) deferred to reciprocal-observation work |

## The text line

One line per event, front-loaded `actor verb object — detail`, so that a
truncated line (a 40-cell braille display, an interrupted screen reader, a
skimmed tail, a token-frugal context slice) still delivers who did what.
Each verb has exactly one rendering rule — the Line column above — which
makes law-6 conformance mechanical: closed verbs × closed bodies × one rule
each = every event renders.

## Amendment

A verb enters only if a law or library construct must recognize it and it
cannot be expressed through an existing verb's payload — the kernel's
invariance test, applied to vocabulary. Open or namespaced vocabularies may
exist in layers above; never here.
