# Backlog

Post-MVP features and deferred decisions. Pick the next item from here and move it to `status.md`
when work starts.

---

## High priority

- Add evaluation

### Mock LLM responses during dev

**Added:** 2026-07-20
**Resolved:** 2026-07-24 — see decisions.md. Small real-API spike first (Route Handler mechanics,
response/error shapes), then mock built against that shape behind a shared interface, state machine
wired to the mock for all UI dev.

## Medium priority

- add lang attribute to speech output elements
- add Edit option
- add icons to buttons

---

## Postponed (decided, not built)

### Turn counter / max-turns

**Discarded:** 2026-08-04 — see decisions.md ("Turn counter / max-turns: discarded, not merely
postponed"). Not planned; explicit user-triggered "End session" remains the only way a session
ends, indefinitely. The 2026-07-26 "AI always speaks last" rule loses its enforcement mechanism as
a consequence — currently just describes the shape of a normal ending, not a guarantee. Related
idea below (closing instruction for the AI's final turn) was part of the same now-discarded
mechanism.

### Per-error-type recovery (fatal vs retryable, Retry action)

**Postponed:** 2026-07-27 — see decisions.md.
v0 error recovery is end-session-only, implemented via a dedicated `END_SESSION` action (see
decisions.md, "Error recovery implemented"). No Retry action, no fatal/retryable
differentiation. Deferred rather than built against a guess of which errors are actually
transient.

### Expert (C1/C2) language level

**Postponed:** 2026-08-10 — see decisions.md ("Language level picker added").
The language level picker ships with only Beginner (A1/A2) and Intermediate (B1/B2). A third
`Expert`/C1/C2 entry was drafted (type union + `languageLevels` array) but pulled back out before
committing — deliberately postponed pending its own manual verification pass, not forgotten.

### Predefined-scenario-picks-its-own-starter setup mode ("mode 2")

**Postponed:** 2026-07-30 — see decisions.md.
The new setup screen (`ChatSetup`) builds only the "freeform chat" case for v0: user picks language and
who starts, from two explicit `Scenario` objects. A second mode — picking a real scenario from the
`scenarios` array, where the scenario itself dictates who starts — was scoped out deliberately, not
overlooked, the same way v0's single-hardcoded-scenario decision sequenced the scenario library
rather than dropping it.

---

## Ideas to be decided upon

- countdown for time remaining to speak
- upon user-turn timeout: give user chance to discard text and restart reply
- **listening-timeout value under reconsideration (2026-08-02)** — see decisions.md, "Reply-phase
  UX flagged for redesign." May be dropped entirely rather than built.
- open app with vocab suggestion of the day
- ~~be able to choose language level~~ — **resolved 2026-08-10**: Beginner/Intermediate picker
  added in `SetupForm`, CEFR level threaded into the AI system instruction (see decisions.md,
  "Language level picker added").
- let app assert language level
- safari takes some time to start listening the first time after it requests permission. Can we ask for permission beforehand?
- troubleshooting section
  - error "Speech recognition service permission check has failed" op iOs: Settings → Privacy & Security → Speech Recognition — is Safari toggled on there?
  - if no speech voice found, add instructions how to add it
- add a user-facing setting for speech rate (current rate correction, 2026-08-01, only normalizes
  speed _across voice engines_ to a consistent baseline — it isn't a slower/faster control, see
  decisions.md)
- use generation_config.thinking_level: "low" for genAI (https://ai.google.dev/gemini-api/docs/text-generation) in regular chat; omit it in evaluation
- add cancel option to listening phase; call recognition.abort()
- add lang attribute to speech output elements
- once real scenarios exist in the `scenarios` array alongside the two freeform-chat `Scenario`
  objects, nothing distinguishes "this is a freeform-chat mode" from "this is a real scenario" at the
  type level — a `category`-type field may be needed (see decisions.md, 2026-07-30)
- ~~voice-availability detection now exists ... but nothing in the UI reacts to it yet~~ —
  **resolved 2026-08-07**: `LanguagePicker` shows a `volumeMute` warning icon next to any language
  with no detected voice (see decisions.md, "Visual/UI design pass"). The "only use written text"
  half was already covered separately — `ThreadView` already skips speaking and calls
  `onAISpeechEnd()` directly when `languageVoice` is falsy.
  (no longer imported since the speak trigger moved to `ThreadView`'s phase-driven effect);
- `textToSpeechTest.ts`/`speechRateAnalysis.ts` are dev-only rate-calibration scratch code, not
  imported by any production path — decide whether to delete, or keep/relocate as documentation of
  how `speechRatePairings` was derived
- reveal ai text while being spoken. we can only approximate this. Divide text into words, then based on speech rate estimate total speaking time, use interval for showing words. create extra ChatAction ABORT_SPEECH and status abortingSpeech. that should reveal all text and dispatch AI_FINISHED_SPEAKING. ABORT_SPEECH can also be used in cleanup of useEffect that starts speech, and when we have no languageVoice. Maybe we need to add next chatAction to ABORT_SPEECH's payload to determine if it should go to user's turn, or end conversation.
- **STT transcript edit capability** (reopened 2026-08-04, see decisions.md) — build `Send`/`Cancel`
  first; Edit adds a third `listening`-phase action later, reusing the `STOP_LISTENING`
  `{ intent: 'edit' }` seam left for it. Real design surface not yet worked through: hand-edit text
  vs. re-run STT, and whether it reverses the 2026-07-19 read-only-transcript precedent.
  **Known landmine to fix when this is built:** `chatReducer.ts`'s `stoppingListening` case only
  has an explicit `TRANSCRIPT_CREATED` branch for `intent === 'send'`; any other `intent` value
  (i.e. `'edit'`, once dispatched) falls through with no `break`/`return` into the
  `TRANSCRIPT_EMPTY` branch and silently discards the transcript instead of routing to an edit UI.
  Inert today since nothing dispatches `intent: 'edit'` yet (see decisions.md, "Reply-phase UX
  redesign implemented").

## Icebox

Nothing here yet — project is too early for confidently-deferred-with-no-plan items.
