# Backlog

Post-MVP features and deferred decisions. Pick the next item from here and move it to `status.md`
when work starts.

---

## High priority (deferred from MVP, not "someday")

### Mock LLM responses during dev

**Added:** 2026-07-20
**What:** A fake/mock response layer for the LLM, so routine UI and flow development doesn't
consume real API budget or hit rate limits.
**Why it's flagged, not decided:** Raised after moving off Gemini's free tier and setting a
$5/month spend cap — every dev-loop reload otherwise draws from that same budget. Not committed as
an MVP requirement. Provider is now decided (Gemini, see decisions.md 2026-07-21), so the mock can
target Gemini's actual response shape — still not yet decided whether/how to build it.

---

## Random ideas - To be decided upon

- countdown for time remaining to speak
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
