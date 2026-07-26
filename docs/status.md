# Project status

**Last updated:** 2026-07-25
**Current phase:** Early build. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spikes 1–4 all complete. AI provider decided (Gemini). The real result type and its mock
implementation are done (see below); next is wiring the v0 state machine to the mock for real.

---

## What exists

- `AIChatResult` type (`src/lib/aiService.ts`) — the real result type planned as
  `ConversationApiResult` in decisions.md, built and named `AIChatResult` instead (see decisions.md
  for the rename note). Discriminated union: `{ success: true; interactionId; message }` or
  `{ success: false; error; status; name }`, matching Spike 3/4's structural (non-`instanceof`)
  error shape.
- Mock chat API route (`src/app/api/aiMock/chat`), toggled via `NEXT_PUBLIC_USE_MOCK_AI`, built
  against the same `AIChatResult`/`sendChatMessage` signature as the real `/api/ai/chat` route.
- `ChatClient.tsx` has a `useReducer`-based skeleton (states: `idle`, chat-created, error, etc.)
  wired to `sendChatMessage`, currently calling the mock with hardcoded placeholder input rather
  than real user input — start/reply flow is not yet wired to STT or the UI controls for real.
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
- Spike 4 (2026-07-25): live SDK failures throw a plain `{ name, status, error: { code, message } }`
  object with no importable error class — discrimination must be structural (`.name`/`.status`),
  not `instanceof`; the SDK's own timeout option is unreliable (interacts with built-in retries),
  `fetchOptions: { signal }` with an `AbortController` is the reliable way to force one; client
  aborts throw `APIUserAbortError`, distinguishable from a 404 by `name` alone; rate-limit shape is
  still doc-sourced, not live-triggered (see decisions.md)

## What's open

- Structured evaluation output fields/depth
- Core data structures (session state, evaluation schema) — deliberately deferred until v0
  interaction/state design is done
- Component/route boundary diagram — same as above
- Scenario count at v1 launch (v0 itself is settled at one hardcoded scenario — this is only about
  what ships after v0)
- Where `systemInstruction` lives/is re-derived for the full session lifetime, now that Spike 3
  showed it must be resent on every request rather than only at session start
- Rate-limit error shape is still doc-sourced only, not empirically confirmed (accepted gap, see
  Spike 4 scope in decisions.md)

## Next step

1. ~~Define the real `ConversationApiResult` type~~ — done, as `AIChatResult` (see decisions.md).
2. ~~Build the mock implementation against that same type/signature~~ — done
   (`/api/aiMock/chat`, toggled via `NEXT_PUBLIC_USE_MOCK_AI`).
3. Finish wiring the v0 state machine (useReducer skeleton already exists in `ChatClient.tsx`) to
   real user input and UI controls, per decisions.md interaction design — still wired to hardcoded
   placeholder strings, not STT input or the Reply/Send controls.
4. Define core data structures (session state shape, transcript shape) consistent with the state
   model — transcript must exclude the hidden opening instruction.
5. Build v0 conversation loop for real: one hardcoded scenario, STT in / TTS out, swap in the real
   Gemini implementation behind the proven-out mock interface.
6. Add evaluation as a second slice once v0 loop works.
7. Revisit scenario count for v1 once v0 exists.
