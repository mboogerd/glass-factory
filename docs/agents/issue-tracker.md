# Issue tracker: Beads (bd)

Issues and specs for this repo live in **beads** (`bd`), a local Dolt-backed issue tracker — not GitHub or GitLab. No git remote is configured, so beads sync is local-only for now.

## Conventions

- **Create an issue**: `bd create --title="..." --description="Why this exists and what needs to be done" --type=task|bug|feature --priority=0-4`
- **Read an issue**: `bd show <id>`
- **List issues**: `bd list --status=open` / `bd list --status=in_progress`
- **Find available work**: `bd ready` (no blockers)
- **Claim**: `bd update <id> --claim`
- **Comment / update fields**: `bd update <id> --title/--description/--notes/--design`
- **Close**: `bd close <id>` (or `bd close <id1> <id2> ...` for multiple), optionally `--reason="..."`
- **Labels**: `bd update <id> --labels=<label1>,<label2>` (see `triage-labels.md` for the role strings)
- **Dependencies**: `bd dep add <issue> <depends-on>`; see `bd blocked` / `bd show <id>`
- **Search**: `bd search <query>`

Do NOT use `bd edit` — it opens `$EDITOR` and blocks non-interactive agents.

## When a skill says "publish to the issue tracker"

Run `bd create` with the ticket's title/description/type.

## When a skill says "fetch the relevant ticket"

Run `bd show <id>`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a parent issue with **child** issues as tickets (`bd create ... --parent=<id>`).

- **Map**: a parent issue holding the Notes / Decisions-so-far / Fog body in its `--description`/`--notes`.
- **Child ticket**: `bd create --title="..." --parent=<map-id> --type=task`, with the question in the description. Use `--notes`/`--design` for `Type:`/`Status:`-equivalent context if finer state is needed beyond bd's own `status` field.
- **Blocking**: `bd dep add <child> <blocker>`. A ticket is unblocked when `bd show <child>` lists no open blockers (`bd blocked` also surfaces this).
- **Frontier**: `bd ready --parent=<map-id>` (or filter `bd list` to the map's children) for open, unblocked, unclaimed issues; first by creation order wins.
- **Claim**: `bd update <id> --claim` — the session's first write.
- **Resolve**: `bd update <id> --notes="<answer>"` (or append to `--description`), then `bd close <id>`, then append a context pointer (gist + link) to the map's Decisions-so-far via `bd update <map-id> --notes=...`.

## Sync

No git remote is configured for this repo yet, so `bd dolt push`/`pull` are not applicable. If a remote is added later, see https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md.
