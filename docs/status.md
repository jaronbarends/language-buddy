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
  Auth: none for MVP — explicitly decided, not just deferred (see decisions.md)
- v0 scope: build against a single hardcoded scenario first; generalize to the scenario library
  once the core loop works (see decisions.md — this sequences the library concept, it doesn't
  replace it)
- Evaluation: build after the basic conversation loop is working, not in parallel and not spiked
  first — feasibility judged well-established enough to skip a spike (see decisions.md)

## What's open

- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until v0
  interaction/state design is done
- Component/route boundary diagram — same as above
- Whether/how to mock LLM responses during regular dev (flagged, not committed — see backlog.md)
- Scenario count at v1 launch (v0 itself is settled at one hardcoded scenario — this is only about
  what ships after v0)

## Next step

1. Implement v0 state machine (useReducer + discriminated union) per decisions.md interaction
   design.
2. Define core data structures (session state shape, transcript shape) consistent with the state
   model — transcript must exclude the hidden opening instruction.
3. Build v0 conversation loop: one hardcoded scenario, STT in / TTS out, Gemini calls per state.
4. Add evaluation as a second slice once v0 loop works.
5. Decide whether/how to mock LLM responses during dev (see backlog.md).
6. Revisit scenario count for v1 once v0 exists.
