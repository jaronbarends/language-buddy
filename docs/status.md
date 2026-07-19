# Project status

**Last updated:** 2026-07-19
**Current phase:** Pre-code. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spike 2 complete, Spike 1 still to run before scope is finalized.

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
- Stack: Next.js App Router + TypeScript + Gemini free tier (see decisions.md for rationale)

## What's open

- Max turns per session (pending Spike 1)
- Number of scenarios shipping at v1
- Whether MVP has any auth/user concept at all
- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until scope is
  final and spike results are in
- Component/route boundary diagram — same as above

## Next step

- Run Spike 1 (Gemini scenario coherence) — see decisions.md for the spike question. Use results
  to close the remaining open MVP scope items above, then proceed to data structures and
  route/boundary architecture.
