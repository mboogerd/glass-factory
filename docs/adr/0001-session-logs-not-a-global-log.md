# Session logs, not a global log

Law 1 originally read "every effect is an event on *the* append-only log,"
and the MVP sync design made the relay a single global append point. We
decided instead that the **session** is the unit of log: each session owns
one totally-ordered append-only log, and the factory's history is the set
of session logs — a partial order stitched by cross-references, total only
within a session. A single global order was doing no semantic work across
unrelated sessions (false serialization) and would have prohibited
parallelism; per-session logs also make read permission natural (observing
a session = reading its log, filtered by capability).

## Consequences

- Global replay / time travel is a causal merge of session logs, not a
  linear scan.
- The relay sequences per session, not globally — appends to different
  sessions parallelize.
- Not everyone may read every log; there is deliberately no unified
  omniscient log.
