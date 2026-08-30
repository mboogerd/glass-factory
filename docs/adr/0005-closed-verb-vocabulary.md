# Closed, kernel-governed verb vocabulary

Every event system people know has extensible types, so we say it
explicitly: the verb vocabulary is closed. A verb exists only because a law
or library construct must recognize it (`join` recomputes disclosure level,
`address` fires law 5, `attach` is ADR 0002, …). Domain meaning
("deployed", "reviewed") lives in the payload of `say`/`produce`, never in
the verb. New verbs pass the kernel's invariance test: needed by a law,
inexpressible through an existing verb's payload.

## Considered options

- **Open/namespaced vocabulary** (`deploy.started`) — rejected: law 6's
  text-linear projection breaks quietly (a projection meeting an unknown
  verb cannot render it meaningfully), and law-relevant semantics get
  smuggled into verbs no law recognizes. An open vocabulary in the wild can
  never be closed again; the reverse move stays available.

## Consequences

- Any interface can render any log; law-6 conformance is checkable by
  construction (closed verbs × closed bodies × one rendering rule each).
- Extensibility lives in payloads and in layers above the kernel, not in
  the vocabulary.
- Two events get different verbs iff a different law or library construct
  fires on them (`say` vs `address` is the canonical instance).
