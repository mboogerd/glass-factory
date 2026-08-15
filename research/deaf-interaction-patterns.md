# Deaf interaction patterns — mapping onto the glass factory

*Perspective-agent report, 2026-08-15. Input to the M0 intersection set.*

Merlijn,

I've read the kernel, M0, and the concept notes. Here is my read as someone
who lives in a fully visual world and has spent a career watching deaf people
bend hearing-first software to their needs.

**Established deaf interaction patterns.** Deaf users are the original power
users of text chat: we adopted TTY, then SMS, then Slack, before they were
mainstream, and we treat persistent, reviewable text as first-class
communication, not a fallback. Key established patterns: (1) *Text-primary,
log-persistent conversation* — the transcript IS the conversation; nothing
exists that isn't written down. (2) *Visual attention-getting* — in deaf
spaces you get someone's attention by waving in their visual field, tapping a
shoulder, or flashing room lights; crucially, the intensity of the signal is
calibrated to urgency, and flashing lights for a doorbell versus a fire alarm
are visibly different. This is a mature, culturally negotiated salience
hierarchy that maps directly to law 4. (3) *Explicit turn-taking* — signed
group conversation cannot overlap the way speech does; deaf meetings use
hand-raising, eye-gaze handoff, and a facilitator who explicitly passes the
floor. One speaker at a time, visibly designated, is the norm — not a
limitation but a discipline hearing meetings would benefit from.
(4) *Peripheral-vision ambient awareness* — deaf people monitor a room
through motion in the visual periphery: who's animated, where clusters form,
whose hands are flying. Ambient state is read from movement and light, never
sound. (5) *Vibration and flash as interrupt channels* — haptics and strobes
carry the "someone is calling you" function, again tiered by urgency.
(6) *Captioning expectations* — anything spoken must have a synchronized,
speaker-attributed text equivalent, and latency above a couple of seconds
breaks conversational repair (the ~2s threshold from the voice study is the
same number caption research converges on).

**Mapping to the requirements.** Conversing with agents in text: naturally
well-served; M0 as written is essentially the deaf-native interface.
Navigating dependency structure: well-served if it's traversable text
(who-depends-on-whom as explicit lists), and later spatial projections are
fine — deaf users navigate spatial visual structure superbly. Time travel
through the log: perfect fit; replay-as-text is how we already consume
recorded meetings (transcripts, not audio). Capability boundaries:
well-served if rendered as visible state ("query-only handle") rather than
implied by who answers.

At risk: **location-based sound** (concept notes, the 3D building) is the big
one — an ambient hum is nothing to us. The accessible equivalent is *visual
activity density*: departments that glow, pulse, or show motion trails
proportional to event rate; in the text-linear projection, a compact activity
ledger per scope ("build-dept: 14 events/min, 3 actors active") that can sit
in the periphery. **Voice-primary interaction (M1)** must never be the only
ingress: every voice channel needs live, speaker-attributed captions on the
event log, and typed input must be a peer, not a fallback — which law 6
already guarantees if you hold the line. **Audio salience cues** (chimes,
ring tones) need the tiered visual/haptic equivalent: distinct visual
signatures per urgency class, because a single generic "flash" collapses your
salience ordering into noise. **Turn-taking in mixed human/agent meetings**:
agents that interject the way hearing people talk over each other will be
unusable for anyone reading captions or an interpreter, because we can only
watch one thing at a time. Adopt the deaf convention: an explicit floor, a
visible request-to-speak queue, and floor handoff as an event on the log.
This also solves agent interruption generally — law 5 ("addressing is a
scoped effect") is already the deaf model of consent-based attention-getting
written as law.

**Universal vs. deaf-specific.**

*Universal (good for everyone, propose for M0):*

- Text-primary, persistent, speaker-attributed transcript as the ground truth
  of every conversation, including voice ones later.
- Explicit turn-taking: one floor per scope, a visible speak-queue, floor
  changes as events.
- Tiered salience with distinct signatures per urgency class; no single
  undifferentiated "notification."
- Interruption as a capability requiring consent (law 5) — deaf culture's
  attention-getting etiquette, generalized.
- Ambient awareness as queryable, compact state per scope (event rate, active
  actors), consumable in any modality.
- Time travel as transcript replay.

*Deaf-specific accommodations (layer on later, not M0-blocking):*

- Visual activity density (glow/motion) as the spatial rendering of the
  ambient hum.
- Flash/vibration hardware alert channels for off-screen interrupts.
- Sub-2-second synchronized captioning on all voice/audio in M1+.
- Sign-language video as an optional conversation medium, with the transcript
  still canonical.

Note the intersection logic: everything in my universal list is
modality-independent state, which is exactly what a screen reader needs too.
M0 as specified already serves us; the additions that matter are explicit
turn-taking and tiered salience as first-class, logged structures rather than
presentation-layer decoration.
