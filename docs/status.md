# Project status

**Last updated:** 2026-07-25
**Current phase:** Pre-code. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spikes 1, 2, and 3 complete. AI provider decided (Gemini). Spike 4 (error shapes) is next, then
defining the real `ConversationApiResult` type and building the mock behind it.

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
- Spike 3 (2026-07-25): `gemini-3.1-flash-lite` is available via `interactions.create`;
  `system_instruction` is NOT carried over via `previous_interaction_id` and must be sent on every
  request; conversation context itself does carry over via `previous_interaction_id` (see
  decisions.md)

## What's open

- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until v0
  interaction/state design is done
- Component/route boundary diagram — same as above
- Scenario count at v1 launch (v0 itself is settled at one hardcoded scenario — this is only about
  what ships after v0)
- Real Gemini error shapes (rate limit, timeout, malformed response) — Spike 4, not yet run
- Where `systemInstruction` lives/is re-derived for the full session lifetime, now that Spike 3
  showed it must be resent on every request rather than only at session start

## Next step

1. Run Spike 4 (Gemini error shapes: malformed response live, rate limit/timeout from docs or
   simulated) — needs the Spike 3 Route Handler scaffolding, already in place.
2. Define the real `ConversationApiResult` type from Spike 3 + Spike 4 findings (success shape,
   error shape, `systemInstruction` required on every call).
3. Build the mock implementation against that same type/signature (see 2026-07-24 mock decision in
   decisions.md).
4. Implement v0 state machine (useReducer + discriminated union) per decisions.md interaction
   design, wired to the mock, not live Gemini.
5. Define core data structures (session state shape, transcript shape) consistent with the state
   model — transcript must exclude the hidden opening instruction.
6. Build v0 conversation loop for real: one hardcoded scenario, STT in / TTS out, swap in the real
   Gemini implementation behind the proven-out mock interface.
7. Add evaluation as a second slice once v0 loop works.
8. Revisit scenario count for v1 once v0 exists.
