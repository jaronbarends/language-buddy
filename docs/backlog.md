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

## Ideas to be decided upon

- countdown for time remaining to speak
- upon user-turn timeout: give user chance to discard text and restart reply
- open app with vocab suggestion of the day
- be able to choose language level
- let app assert language level
- safari takes some time to start listening the first time after it requests permission. Can we ask for permission beforehand?
- troubleshooting
  - error "Speech recognition service permission check has failed" op iOs: Settings → Privacy & Security → Speech Recognition — is Safari toggled on there?
  - if no speech voice found, add instructions how to add it
- add setting for speech rate

## Icebox

Nothing here yet — project is too early for confidently-deferred-with-no-plan items.
