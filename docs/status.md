# Project status

**Last updated:** 2026-07-21
**Current phase:** Pre-code. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spike 1 and Spike 2 both complete. AI provider now decided (Gemini). Remaining open items being
closed before moving to data structures and route/boundary architecture.

---

## What exists

- Nothing built yet — no repo, no code.
- Spike code for STT/TTS exists on branch `spike-speech-to-text` (spike-only, not production code).

## What's decided

- Concept: scenario library from the start (not a single hardcoded scenario)
- Persona: generic friendly acquaintance, not a specific character (see decisions.md)
- Voice: STT input is an MVP hard requirement; TTS output is now also MVP scope (moved from
  deferred after Spike 2 — see decisions.md)
- STT transcript review step: not needed for MVP — Spike 2 showed STT accuracy is good enough to
  send straight to the LLM (see decisions.md)
- Session state: in-memory only for MVP, no persistence
- "Tips" = the structured evaluation (grammar/vocab/nuance) — one feature, one name
- Framework: Next.js App Router + TypeScript (see decisions.md for rationale)
- AI backend: paid tier, not free tier — Gemini free tier abandoned after hitting a 20 RPD account
  cap; monthly AI API budget capped at $5 (see decisions.md)
- Spike 1 ran as a plain Node script (not inside Next.js), human typed the "user" side live
  (see decisions.md)
- A Gemini Project Spend Cap was set (Google AI Studio → Spend tab) before running paid-tier
  requests (see decisions.md)
- **AI provider for MVP: Gemini** — Spike 1 (2026-07-21) held cleanly through 10 turns with no
  drift; OpenAI comparison spike deliberately skipped rather than spend more to confirm a result
  already judged good enough (see decisions.md)
- Max turns per session: not derived from a spike-observed breaking point (none appeared within 10
  tested turns) — will be set/tuned during build instead of fixed up front (see decisions.md)

## What's open

- Number of scenarios shipping at v1
- Whether MVP has any auth/user concept at all
- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until scope is
  final and spike results are in
- Component/route boundary diagram — same as above
- Whether/how to mock LLM responses during regular dev, to protect the $5/month budget and avoid
  burning real API calls on routine UI/flow testing (flagged, not committed — see backlog.md)

## Next step

1. Close the remaining open MVP scope items above (scenario count at v1, auth/user concept,
   structured evaluation output depth) — none of these are pending on further spikes.
2. Decide whether/how to mock LLM responses during regular dev (see backlog.md) — provider is now
   known (Gemini), so the mock can target Gemini's actual response shape.
3. Move to core data structures (session state, evaluation schema) and the component/route
   boundary diagram now that scope and provider are settled.
