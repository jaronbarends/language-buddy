# Project status

**Last updated:** 2026-07-27
**Current phase:** Early build. Concept locked (scenario-library based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spikes 1–4 all complete. AI provider decided (Gemini). State machine now runs the full happy path
end-to-end against typed text input and the mock AI API, `STOP_CHAT` now ends the session from
any phase, and generic error recovery (end-session-only, via a dedicated `END_SESSION` action)
is implemented. Next up: listening timeout, then wiring in real STT/TTS and the real Gemini call
— with a visual/UI design pass sequenced after that, before evaluation.

---

## What exists

- `AIChatResult` type (`src/lib/aiService.ts`) — the real result type planned as
  `ConversationApiResult` in decisions.md, built and named `AIChatResult` instead (see decisions.md
  for the rename note). Discriminated union: `{ success: true; interactionId; message }` or
  `{ success: false; error; status; name }`, matching Spike 3/4's structural (non-`instanceof`)
  error shape.
- Mock chat API route (`src/app/api/aiMock/chat`), toggled via `NEXT_PUBLIC_USE_MOCK_AI`, built
  against the same `AIChatResult`/`sendChatMessage` signature as the real `/api/ai/chat` route.
- `chatReducer.ts` — 9-state discriminated union (`readyForNewChat`, `waitingForAI`,
  `aiTurnSpeaking`, `readyForUserStart`, `readyForUserReply`, `listening`, `listeningTimedOut`,
  `ended`, `error`), reflecting the 2026-07-27 decisions to drop `sending` and `initializing` from
  the original 2026-07-22/07-23 model, and the 2026-07-27 rename of `idle` to `readyForNewChat`
  (see decisions.md). Reducer covers the full happy-flow transitions (`readyForNewChat` →
  `readyForUserStart`/`waitingForAI` → `aiTurnSpeaking` → `readyForUserReply` → `listening` →
  `waitingForAI` → ... → `ended`).
- `ChatClient.tsx` (Client Component) owns the `useReducer` and drives the loop end-to-end against
  a single hardcoded scenario: sends typed input (via a `MockTTS` textarea stand-in, not real STT)
  to `sendChatMessage`, dispatches on success/failure, and fires a stubbed `speakAIResponse` in
  place of real TTS. `previousInteractionId` is tracked in component state and threaded through
  each call, per Spike 3's finding that context (but not `systemInstruction`) carries over via
  `previous_interaction_id`.
- `ControlsArea.tsx` — derives primary-button label/handler from phase via `canStartChat` /
  `canStartWithUser` / `canStartReply` / `canSendReply` helpers in `chatReducer.ts`; "End
  conversation" button always rendered (dispatches `STOP_CHAT`, now handled from every reducer
  phase — see decisions.md).
- `ErrorArea.tsx` — renders the raw error message from the `error` phase; unstyled, no
  per-error-type differentiation (see "What's decided" below). Generic error recovery is
  wired up: from `error`, the only available action is "End this session" (a dedicated
  `END_SESSION` action, distinct from `STOP_CHAT`), which resets straight to
  `readyForNewChat` with an empty thread. The ghost "End conversation" button is hidden
  while in `error` (see decisions.md, 2026-07-27).
- `ThreadView.tsx` — renders `threadItems` from state, styled by author (`ai`/`user`).
- `MockTTS.tsx` — textarea standing in for both STT input and a visual TTS placeholder; enabled
  only in the `listening` phase.
- **Working happy flow:** user-opens-first path (`aiHasFirstTurn = false`), full turn loop via
  typed input and the mock AI API, confirmed running end-to-end.
- Spike code for STT/TTS exists on branch `spike-speech-to-text` (spike-only, not production code).
- **No visual/UI design work done yet** — current components are functional/unstyled. Timing for
  the design pass is now decided (see below); the design content itself is not.

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
- Auth: none for MVP — explicitly decided, not just deferred (see decisions.md)
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
- Conversation always ends with AI speaking last (2026-07-26) — overrules the original "whichever
  side doesn't open, closes" rule; requires a turn counter to enforce properly, which doesn't exist
  yet (see decisions.md)
- No dedicated `sending` state (2026-07-27) — folded into `waitingForAI`, since it never carried
  distinct meaning beyond "message in flight" (see decisions.md)
- No `initializing` state (2026-07-27) — unnecessary now that `interactions.create` resends
  `systemInstruction` every turn; "who opens" is a static per-scenario value for v0's single
  hardcoded scenario (see decisions.md)
- Turn counter / max-turns postponed (2026-07-27) — explicit user-triggered "End conversation" is
  the only way a v0 session ends for now; building termination logic isn't blocking anything yet
  (see decisions.md)
- `listeningTimedOut` deferred to real STT work (2026-07-27) — timeout logic is meaningless against
  the current mock textarea; will be built alongside real STT integration rather than against a
  guessed shape (see decisions.md)
- `idle` renamed to `readyForNewChat` (2026-07-27) — `idle` didn't convey that a new chat can be
  started from this state; name now matches the `readyForUser*` pattern (see decisions.md)
- `STOP_CHAT` now handled from every reducer phase (2026-07-27) — checked once before the
  phase-specific switch, transitioning straight to `ended` from any phase except `readyForNewChat`
  and `ended` itself (see decisions.md)
- Error recovery for v0: end-session only, no Retry action (2026-07-27) — implemented via
  a dedicated `END_SESSION` action (not `STOP_CHAT`, contrary to the same-day plan that
  assumed the existing top-level handling would cover it — see decisions.md). From
  `error`, the only action offered is "End this session", which resets to
  `readyForNewChat` with an empty thread; the generic "End conversation" button is hidden
  in this phase. Per-error-type differentiation (fatal vs retryable) deferred, not built
  against a guess of which errors are actually transient (see decisions.md).
- **Visual/UI design pass sequenced after the core loop, before evaluation (2026-07-27)** —
  interaction design is still actively changing, so styling now risks rework; the core loop being
  functionally settled first gives a low-risk, demoable styling target. Only the _timing_ is
  decided — token values, layout, and accessibility approach are still open (see decisions.md)

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
- Turn counter / max-turns mechanism and any "wrap up the conversation" closing instruction for the
  AI's final turn — postponed by decision, not designed (see decisions.md, 2026-07-26/07-27)
- Error UI polish only — `ErrorArea`'s message display exists but is unstyled; no Retry
  action planned for v0 (see decisions.md, 2026-07-27). End-session-from-error is
  implemented and functional (dedicated `END_SESSION` path — see decisions.md); only the
  visual styling is outstanding, folded into the general visual/UI design pass below.
- `listeningTimedOut` not yet wired — no dispatch site exists; deferred to STT work by decision
- **Visual/UI design content** — tokens, layout, component styling, accessibility approach. Timing
  is decided (after the core loop, before evaluation); the actual design.md content doesn't exist
  yet.

## Next step

1. ~~Define the real `ConversationApiResult` type~~ — done, as `AIChatResult` (see decisions.md).
2. ~~Build the mock implementation against that same type/signature~~ — done
   (`/api/aiMock/chat`, toggled via `NEXT_PUBLIC_USE_MOCK_AI`).
3. ~~Wire the v0 state machine to the mock, drive the full happy-path loop~~ — done: typed input,
   mock AI, full turn loop from `readyForNewChat` through `ended` all working.
4. ~~Fix `STOP_CHAT` to be handled from every reducer phase, not just `listening`~~ — done: checked
   once before the phase-specific switch (see decisions.md).
5. ~~Build real error handling: reducer `error` case behavior + Retry action~~ — done:
   end-session-only recovery, implemented as a dedicated `END_SESSION` action that resets
   to `readyForNewChat`; no Retry action for v0 (see decisions.md, 2026-07-27).
6. Wire real STT input, replacing the `MockTTS` textarea, and implement `listeningTimedOut`
   alongside it (bundled per the 2026-07-27 decision).
7. Wire real TTS output, replacing the `speakAIResponse` console.log/setTimeout stub.
8. Swap the mock AI implementation for the real `/api/ai/chat` route behind the same
   `sendChatMessage`/`AIChatResult` signature.
9. **Visual/UI design pass** on the now-functionally-complete conversation loop: define tokens,
   layout, and accessibility approach; restyle `ThreadView`/`ControlsArea`/STT-and-error UI against
   it (see decisions.md, 2026-07-27).
10. Define core data structures (session state shape, transcript shape) consistent with the state
    model — transcript must exclude the hidden opening instruction.
11. Add evaluation as a second slice once the full v0 conversation loop (steps 4–9) is solid and
    styled.
12. Revisit scenario count for v1, and turn counter / max-turns, once v0 exists.
