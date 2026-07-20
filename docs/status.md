# Project status

**Last updated:** 2026-07-20
**Current phase:** Pre-code. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spike 2 complete, Spike 1 about to start (scope just revised — see decisions.md).

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
- Spike 1 will run as a plain Node script (not inside Next.js), human types the "user" side live
  (see decisions.md)
- A Gemini Project Spend Cap must be set (Google AI Studio → Spend tab) before running any
  paid-tier requests (see decisions.md)

## What's open

- **AI provider for MVP: Gemini vs OpenAI** — Spike 1 will run against Gemini first, then likely
  against OpenAI (GPT-4o-mini) for comparison, before this is decided (see decisions.md)
- Max turns per session (pending Spike 1 results, across whichever provider(s) it's run against)
- Number of scenarios shipping at v1
- Whether MVP has any auth/user concept at all
- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until scope is
  final and spike results are in
- Component/route boundary diagram — same as above
- Whether/how to mock LLM responses during regular dev, to protect the $5/month budget and avoid
  burning real API calls on routine UI/flow testing (flagged, not committed — see backlog.md)

## Next step

1. Set a Gemini Project Spend Cap in AI Studio (a little under $5, to allow for the ~10 min
   enforcement delay — see decisions.md).
2. Build Spike 1 as a standalone Node script, run live against Gemini (paid tier) — see
   decisions.md for the spike question and done criteria.
3. Likely re-run the same spike against OpenAI (GPT-4o-mini) for comparison.
4. Use combined results to close the remaining open MVP scope items above, then proceed to data
   structures and route/boundary architecture.
