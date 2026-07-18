# Project status

**Last updated:** 2026-07-17
**Current phase:** Pre-code. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
two technical spikes identified and about to run before scope is finalized.

---

## What exists

- Nothing built yet — no repo, no code.

## What's decided

- Concept: scenario library from the start (not a single hardcoded scenario)
- Persona: generic friendly acquaintance, not a specific character (see decisions.md)
- Voice: STT input is an MVP hard requirement; TTS output deferred but tracked
- STT transcript review step: deferred to dev/spike findings
- Session state: in-memory only for MVP, no persistence
- "Tips" = the structured evaluation (grammar/vocab/nuance) — one feature, one name
- Stack: Next.js App Router + TypeScript + Gemini free tier (see decisions.md for rationale)

## What's open

- Max turns per session (pending Spike 1)
- Whether the STT review step is needed at MVP (pending Spike 2)
- Number of scenarios shipping at v1
- Whether MVP has any auth/user concept at all
- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until scope is
  final and spike results are in
- Component/route boundary diagram — same as above

## Next step

- Run Spike 1 (Gemini scenario coherence) and Spike 2 (STT accuracy for Norwegian) — see
  decisions.md for spike questions. Use results to close the open MVP scope items above, then
  proceed to data structures and route/boundary architecture.
