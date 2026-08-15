# Capability enforcement lives at the relay, not the substrate

The mediator/relay enforces capabilities at its two live checkpoints:
on append (mutate grants) and on fan-out (query grants, with the
observation logged — reciprocal glass). The cold path is a git repo, and
anyone who can clone it reads everything, with no capability filter and no
observation event. We accept this: repo access *is* the crudest capability,
granted out-of-band, and everyone holding it is a trusted participant.
M0 capabilities govern the live surface — appending, delivery, attention —
which is where the ambient-workplace properties live; the cold path
guarantees attribution (signatures) but not confidentiality or reciprocity.

## Considered options

- **Restrict cloning** — rejected: forkability is a stated value; exit must
  stay cheap. Security has limits; the job is to offer an experience people
  do not want to fork away from.
- **Per-scope logs or encryption from day one** — rejected for M0: real
  cost, no M0 need. It remains the upgrade path if a deployment ever needs
  walled scopes that survive repo access — a library/deployment concern,
  since the kernel obliges boundaries to be visible, not every substrate to
  enforce them.
