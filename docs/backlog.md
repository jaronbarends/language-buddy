# Backlog

Post-MVP features and deferred decisions. Pick the next item from here and move it to `status.md`
when work starts.

---

## High priority

### Mock LLM responses during dev

**Added:** 2026-07-20
**Resolved:** 2026-07-24 — see decisions.md. Small real-API spike first (Route Handler mechanics,
response/error shapes), then mock built against that shape behind a shared interface, state machine
wired to the mock for all UI dev.

---

## Postponed (decided, not built)

### Turn counter / max-turns

**Postponed:** 2026-07-27 — see decisions.md.
Enforces the 2026-07-26 "AI always speaks last" rule once built. Until then, explicit user-triggered
"End conversation" is the only way a v0 session ends. Related idea below (closing instruction for
the AI's final turn) is part of the same mechanism, not a separate decision.

### Per-error-type recovery (fatal vs retryable, Retry action)

**Postponed:** 2026-07-27 — see decisions.md.
v0 error recovery is end-session-only, implemented via a dedicated `END_SESSION` action (see
decisions.md, "Error recovery implemented"). No Retry action, no fatal/retryable
differentiation. Deferred rather than built against a guess of which errors are actually
transient.

---

## Ideas to be decided upon

- countdown for time remaining to speak
- upon user-turn timeout: give user chance to discard text and restart reply
- open app with vocab suggestion of the day
- be able to choose language level
- let app assert language level
- add separate instruction to end conversation on ai's last turn
- safari takes some time to start listening the first time after it requests permission. Can we ask for permission beforehand?
- troubleshooting
  - error "Speech recognition service permission check has failed" op iOs: Settings → Privacy & Security → Speech Recognition — is Safari toggled on there?
  - if no speech voice found, add instructions how to add it
- add setting for speech rate
- use generation_config.thinking_level: "low" for genAI (https://ai.google.dev/gemini-api/docs/text-generation) in regular chat; omit it in evaluation
- add cancel option to listening phase; call recognition.abort()

## Icebox

Nothing here yet — project is too early for confidently-deferred-with-no-plan items.
