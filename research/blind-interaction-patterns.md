# Blind interaction patterns — mapping onto the glass factory

*Perspective-agent report, 2026-08-15. Input to the M0 intersection set.*

Merlijn,

I've read the kernel, M0, and the concept notes. Here is my assessment as
someone who lives in a screen reader and advises teams building for us.

**How blind users actually work.** The established patterns are:
(1) *Linearization* — a screen reader turns any interface into a single
stream; anything that only makes sense as a 2D arrangement is lost.
(2) *Structural navigation* — we don't read top-to-bottom; we jump by
headings (H-key), landmarks, and rotor-style element lists ("show me all
links/headings/form fields"). Structure IS our navigation.
(3) *Keyboard-only operation* — every action reachable without a pointer,
with consistent shortcuts. (4) *Braille display reading* — 40–80 cells at a
time; favors terse, front-loaded lines where the first words carry the
meaning. (5) *High-rate speech* — many of us listen at 400+ wpm; we skim by
audio, so verbose boilerplate is a tax paid on every line. (6) *Earcons and
spatial audio* — short, learned sound signatures and positional audio; blind
users are often power users of these, better at exploiting them than sighted
users. (7) *Summary-first drill-down* — announce the count and gist, expand
on demand ("list, 12 items" before any item). (8) *Search-first* — when
structure is deep, we type-to-find rather than traverse.

**Mapping to glass-factory requirements.** Conversation with agents is
naturally excellent: chat is already linear text, and the event log is a
screen reader's native format — an append-only stream with structural jumps
is exactly how we read everything. Time travel is likewise free: replaying a
log linearly is not a degraded mode for us, it's the ideal one.
Location-based sound in the 3D building genuinely serves us *better* than
sighted users — a department that hums where its work is, an agent's voice
localized in space — provided every sound has a text-queryable equivalent.

At risk: anything assuming visual scanning. **Dependency graphs** linearize
badly; the established answer is not "an accessible diagram" but a different
structure entirely: a tree view rooted at the node I care about ("agent X:
depends on 3, depended on by 7 — expand?"), with summary-first drill-down and
search-first entry. Nobody blind reads a whole graph; we interrogate it. The
"each agent is its own historian" pattern is exactly right — asking a node
about its neighborhood is the accessible graph. **Ambient awareness** must
not become continuous chatter — audio has no periphery unless designed:
sighted peripheral vision is pre-attentive, but a speech stream interrupts.
The established pattern is earcons (sub-second, learned, distinct per
department/event-class) at low volume plus an on-demand "what's happening"
summary command, with law-4 salience deciding which few events earn a sound
at all. **Presence in a scope** is a solved pattern from MUDs and conference
calls: an announced roster on entry ("shared scope: Merlijn, agent-builder,
2 observers"), an earcon on join/leave, and a "who's here" query. Reciprocal
glass helps us here — observation-as-event means I can *hear* being watched,
which sighted users get from a glance. **Capability boundaries** must be
announced, not styled: "query-only handle" spoken up front, never conveyed by
a grayed-out button. **Projected visuals** (M1's mid-conversation
projections) need the agent to narrate what it projected — the projection
must be a rendering of a text-expressible artifact, per law 6, never the
artifact itself.

Concrete M0 asks: heading/landmark structure on every projection surface;
every list prefixed with count and type; front-loaded terse event lines
(actor–verb–object first, metadata after) for braille; full keyboard command
set; a global search/jump command; queryable equivalents for anything later
rendered spatially.

**Universal patterns** (good for everyone — likely the intersection with
deaf users):

- Text-linear reference interface as the source of truth (law 6)
- Summary-first drill-down everywhere: counts and gists before contents
- Tree/interrogation navigation of the dependency graph instead of
  diagram-reading; "ask the node" as the primary graph interface
- Search-first jump to any actor, artifact, or scope
- Keyboard-only operability with consistent commands
- Explicit roster and join/leave events for scope presence
- Capability boundaries stated in text, never conveyed only by styling
- Salience-ordered, rate-limited notifications with an on-demand digest
- Front-loaded, terse event-line grammar (helps braille, helps skimming,
  helps agents parsing)

**Blind-specific accommodations:**

- Earcon vocabulary and spatial-audio placement for ambient awareness (deaf
  users need the visual dual: peripheral glow/motion)
- Speech-rate control and speech-optimized verbosity levels
- Braille display line-length discipline (40-cell-aware formatting)
- Narrated equivalents of projected visuals ("I've projected a graph
  showing…")
- Screen-reader semantics (ARIA landmarks/roles) on any GUI projection

The encouraging headline: the kernel already made the right bet. Law 6 plus
the event log means M0 is not accessibility work bolted on — it's the
interface my community would have designed anyway. The intersection with deaf
users is essentially the whole universal list above; where we diverge is only
the *channel* of ambient awareness (sound for us, light for them), and both
derive from the same salience-ordered event stream.
