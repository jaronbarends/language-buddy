# Project status

**Last updated:** 2026-07-30
**Current phase:** Early build. Concept locked (scenario-library-based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spikes 1–4 all complete. AI provider decided (Gemini). State machine now runs the full happy path
end-to-end against real STT input and the mock AI API, `STOP_CHAT` now ends the session from
any phase, generic error recovery (end-session-only, no dispatched action) is implemented, and
empty-transcript input silently retries rather than sending/erroring. **The setup screen is now
built**: `ChatContainer` renders `ChatSetup` (language + who-starts, pre-selected defaults) or
`ChatConversation` (renamed from `ChatClient`); ending a session is a direct `onEndSession` prop
call from `ChatConversation` to `ChatContainer`, no longer a reducer action. `chatReducer`'s
`chatStartPending`/`chatEnded` renames and the `END_SESSION` removal are all in place (see
decisions.md, 2026-07-30, for the one gap — `chatEnded` — caught and fixed while writing this
update). Next up: listening timeout, then real TTS and the real Gemini call — with a visual/UI
design pass sequenced after that, before evaluation.

---

## What exists

- **Setup screen (2026-07-30, implemented):**
  - `ChatContainer.tsx` (`src/app/chat/ChatContainer.tsx`) — Client Component owning a
    `ContainerState` union (`'setup'` / `'conversation'; chatConfig`) and the selected `Language`.
    `chat/page.tsx` is now a thin Server Component rendering only this. Renders `ChatSetup` or
    `ChatConversation` depending on state; `handleSessionEnd` (passed down as `onEndSession`) resets
    back to `'setup'`.
  - `ChatSetup.tsx` (`src/app/chat/chatSetup/ChatSetup.tsx`) — form with a language fieldset
    (delegated to a new `LanguagePicker` subcomponent) and an inline AI/user starter radio pair.
    Both load pre-selected (`supportedLanguages[0]`, `starter: 'ai'`). On submit, resolves to
    `freeformChatWithAIStart`/`freeformChatWithUserStart`, builds `ChatConfig` via `getChatConfig`,
    calls `onStartSession(chatConfig)`.
  - `LanguagePicker.tsx` (`src/app/chat/chatSetup/components/LanguagePicker.tsx`) — renders a radio
    per `Language` in `languages`, calls `onChangeLanguage` on change.
  - `languages.ts` (`src/lib/languages.ts`) — `supportedLanguages: Language[]`: Dutch (`nl-NL`),
    Norwegian Bokmål (`nb-NO`).
  - `freeformChatWithAIStart` / `freeformChatWithUserStart` (`src/lib/scenarios.ts`) — two
    `Scenario` objects outside the `scenarios` array, differing only in `aiHasFirstTurn`.
  - `ChatConversation.tsx` — renamed from `ChatClient.tsx`, moved to its own folder
    (`src/app/chat/chatConversation/`). Now receives `chatConfig` and `onEndSession` as props (no
    longer owns scenario selection). Start-of-chat is triggered by a mount `useEffect` (guarded by
    `hasStartedRef` against StrictMode's double-invoke) instead of a button inside this component.
  - `chatReducer.ts`: initial/renamed phase is `chatStartPending` (was `readyForNewChat`/`idle`);
    terminal phase is `chatEnded` (was `ended` — this rename was decided but not yet applied when
    the rest of the setup screen shipped; applied now, see decisions.md). `END_SESSION` action
    removed entirely; `canStartChat` (flagged as dead code once Start moved to `ChatSetup`) is
    already gone.
  - Known stale-doc note, unrelated to this feature: `Language`'s field has been `languageTag` (not
    `locale`) since commit `2738e0d`, predating the setup screen — earlier status.md entries below
    describing `{ name, locale }` are out of date.

- `AIChatResult` type (`src/lib/aiService.ts`) — the real result type planned as
  `ConversationApiResult` in decisions.md, built and named `AIChatResult` instead (see decisions.md
  for the rename note). Discriminated union: `{ success: true; interactionId; message }` or
  `{ success: false; error; status; name }`, matching Spike 3/4's structural (non-`instanceof`)
  error shape.
- Mock chat API route (`src/app/api/aiMock/chat`), toggled via `NEXT_PUBLIC_USE_MOCK_AI`, built
  against the same `AIChatResult`/`sendChatMessage` signature as the real `/api/ai/chat` route.
- `chatReducer.ts` — 11-state discriminated union (`chatStartPending`, `waitingForAI`,
  `aiTurnSpeaking`, `readyForUserStart`, `readyForUserReply`, `listening`, `listeningStopped`,
  `readyForSendingUserReply`, `listeningTimedOut`, `chatEnded`, `error`) — current names, post
  2026-07-30 renames (see "Setup screen" bullet above and decisions.md). Reducer covers the full
  happy-flow transitions (`chatStartPending` → `readyForUserStart`/`waitingForAI` → `aiTurnSpeaking`
  → `readyForUserReply` → `listening` → `waitingForAI` → ... → `chatEnded`).
- `ChatConversation.tsx` (Client Component, see "Setup screen" bullet above) owns the `useReducer`
  and drives the loop end-to-end: sends the transcript from real STT (`SpeechToText.tsx`, see
  below) to `sendChatMessage`, dispatches on success/failure, and fires a stubbed
  `speakAIResponse` in place of real TTS. `previousInteractionId` is tracked in component state and
  threaded through each call, per Spike 3's finding that context (but not `systemInstruction`)
  carries over via `previous_interaction_id`.
- `ControlsArea.tsx` — derives primary-button label/handler from phase via `canStartWithUser` /
  `canStartReply` / `canSendReply` / `chatHasEnded` / `hasError` helpers in `chatReducer.ts`; "End
  conversation" button always rendered except in `error` (dispatches `STOP_CHAT`, handled from
  every reducer phase — see decisions.md). From `chatEnded`/`error`, the primary button reads "End
  this session" and calls `onEndSession` directly (no dispatch — see "Setup screen" bullet above).
- `ErrorArea.tsx` — renders the raw error message from the `error` phase; unstyled, no
  per-error-type differentiation. Generic error recovery (end-session-only, no Retry) is wired up
  via the `onEndSession` prop call described above, not a reducer action.
- `ThreadView.tsx` — renders `threadItems` from state, styled by author (`ai`/`user`).
- **Real STT wired up** (`SpeechToText.tsx`), per the 2026-07-28 design: starts/stops Web Speech
  API recognition keyed off `phase` (`listening` → start, `listeningStopped` → stop). With
  `recognition.interimResults = true`, every `onresult` event joins _all_ current results
  (interim + final) into a single `liveTranscript` string (ref + state); `onend` reads
  `liveTranscriptRef.current` directly rather than building a transcript from an accumulated array
  of final-only results (see decisions.md, 2026-07-29, "live interim transcript"). `MockTTS.tsx`
  (the old typed-textarea stand-in for the _entire_ input mechanism) is deleted, replaced by
  `MockSTT.tsx` — a narrower dev/testing convenience, not a stand-in for STT itself: its textarea
  is only read (via an imperative handle) as a fallback when the real recognition transcript comes
  back empty, so development can continue by typing instead of speaking without needing a working
  mic on every pass (see decisions.md, 2026-07-29). `SpeechResults.tsx` renders `liveTranscript`
  live as the user speaks, showing a "Listening…" placeholder while it's still empty and a "…"
  typing indicator once text has appeared, both only while `phase.status === 'listening'`.
- `next.config.ts` sets `allowedDevOrigins: ['*.ngrok-free.app']`, letting the Next.js dev
  server accept requests tunneled through ngrok (see decisions.md, 2026-07-29).
- **Empty-transcript handling:** new `TRANSCRIPT_EMPTY` action. When neither real STT nor the
  `MockSTT` fallback produces a transcript, `ChatConversation.tsx` dispatches `TRANSCRIPT_EMPTY` in
  addition to `TRANSCRIPT_CREATED`; the reducer sends `listeningStopped` straight back to
  `readyForUserReply` (silent retry — no error, nothing sent) rather than into
  `readyForSendingUserReply` with an empty string (see decisions.md, 2026-07-29).
- **Working happy flow:** user-opens-first path (`aiHasFirstTurn = false`), full turn loop via
  real STT input and the mock AI API, confirmed running end-to-end.
- Spike code for STT/TTS exists on branch `spike-speech-to-text` (spike-only, not production code).
- **No visual/UI design work done yet** — current components are functional/unstyled. Timing for
  the design pass is now decided (see below); the design content itself is not.
- `ChatConversation.tsx` receives a `chatConfig` prop (`ChatConfig`, from `src/lib/chatConfig.ts`)
  built via `getChatConfig(language, scenario)` — built in `ChatSetup.tsx` now, not `page.tsx` (see
  "Setup screen" bullet above; still only the two freeform-chat scenarios, not the scenario
  library, per decisions.md, 2026-07-28/07-30).

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
- `idle` renamed to `readyForNewChat` (2026-07-27) — superseded 2026-07-30, renamed again to
  `chatStartPending` (see below)
- `STOP_CHAT` now handled from every reducer phase (2026-07-27) — checked once before the
  phase-specific switch, transitioning straight to `chatEnded` from any phase except
  `chatStartPending` and `chatEnded` itself (see decisions.md)
- Error recovery for v0: end-session only, no Retry action (2026-07-27) — the _policy_ (no Retry,
  no per-error-type differentiation) still stands; the _mechanism_ is now a direct `onEndSession`
  prop call, not a dispatched action (see below)
- **Visual/UI design pass sequenced after the core loop, before evaluation (2026-07-27)** —
  interaction design is still actively changing, so styling now risks rework; the core loop being
  functionally settled first gives a low-risk, demoable styling target. Only the _timing_ is
  decided — token values, layout, and accessibility approach are still open (see decisions.md)
- **STT integration design decided (2026-07-28)** — `listeningStopped` and
  `readyForSendingUserReply; transcript` phases, `STOP_LISTENING`/`TRANSCRIPT_CREATED` actions, and
  a `SpeechToText` child component (props: `phase`, `onTranscriptCreated`, `onError`). Transcript
  displayed read-only before send, not editable — scaffolding for the still-deferred
  `listeningTimedOut` work, not a reversal of the no-review-step decision (see decisions.md).
  **Implemented (2026-07-29)** — see "What exists" above and decisions.md.
- **Empty-transcript UX: silent retry, not an error (2026-07-29)** — if STT (and the `MockSTT`
  dev fallback) both produce no transcript, the user is dropped back to `readyForUserReply` with
  no message sent and no error shown, rather than surfacing an empty send or a failure state (see
  decisions.md).
- **Setup screen: `ChatContainer`/`ChatSetup` components, `ChatClient` renamed to
  `ChatConversation` (2026-07-30, implemented same day)** — `ChatContainer` (rendered by
  `chat/page.tsx`) owns whether to render `ChatSetup` (language radios via `LanguagePicker` +
  inline starter radios, pre-selected defaults, "Start conversation" button) or
  `ChatConversation`. v0 builds only the "freeform chat" case (see decisions.md and "Setup screen"
  bullet above).
- **Freeform chat = two explicit `Scenario` objects, not in the `scenarios` array (2026-07-30,
  implemented)** — user-starts/AI-starts variants, imported directly by `ChatSetup`, reusing the
  existing `Scenario` type and instruction text unchanged (see decisions.md).
- **New `languages.ts` config file, separate from `language.ts`'s `Language` type (2026-07-30,
  implemented)** (see decisions.md).
- **`chatReducer` scope narrowed to conversation-only states; `END_SESSION` removed (2026-07-30,
  implemented)** — ending a session and returning to `ChatSetup` is now a direct `onEndSession`
  prop call from `ChatConversation` to `ChatContainer`, not a dispatched action. `ended` renamed to
  `chatEnded` (decided 2026-07-30, applied same day this status update was written — see
  decisions.md).
- **Start-of-chat trigger moves to a mount `useEffect`; `readyForNewChat` renamed to
  `chatStartPending` (2026-07-30, implemented)** — `hasStartedRef` guards against React 19
  StrictMode's dev-mode double-invoked effects (see decisions.md).

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
  implemented and functional (direct `onEndSession` call — see decisions.md); only the
  visual styling is outstanding, folded into the general visual/UI design pass below.
- `listeningTimedOut` not yet wired — no dispatch site exists; deferred to STT work by decision
- **Visual/UI design content** — tokens, layout, component styling, accessibility approach. Timing
  is decided (after the core loop, before evaluation); the actual design.md content doesn't exist
  yet.
- **Predefined-scenario-picks-its-own-starter (freeform-chat "mode 2")** remains out of scope —
  deliberately deferred alongside the setup-screen decision, tracked in backlog.md.

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
6. ~~Wire real STT input, replacing the `MockTTS` textarea~~ — done: `SpeechToText` component,
   `listeningStopped` → `readyForSendingUserReply` phases, transcript displayed read-only before
   send, plus empty-transcript handling (`TRANSCRIPT_EMPTY`) and `MockSTT` as a dev-only fallback
   (see decisions.md, 2026-07-29). `listeningTimedOut` remains deferred (2026-07-27 decision) — the
   stop/send split was built specifically so timeout can reuse the same path later.
7. ~~Build the setup screen extraction~~ — done: `languages.ts`, the two freeform-chat `Scenario`
   objects, `ChatSetup` (+ `LanguagePicker`), `ChatContainer`; `ChatClient` renamed to
   `ChatConversation`; `chatReducer.ts` updated (`chatStartPending`, `chatEnded`, `END_SESSION`
   removed, dead `canStartChat` already gone); chat-start trigger moved into a mount `useEffect`
   with a StrictMode ref guard; `ChatConversation`'s end-session handler calls `onEndSession`
   directly (see decisions.md, 2026-07-30, and "Setup screen" bullet above).
8. Wire real TTS output, replacing the `speakAIResponse` console.log/setTimeout stub.
9. Swap the mock AI implementation for the real `/api/ai/chat` route behind the same
   `sendChatMessage`/`AIChatResult` signature.
10. **Visual/UI design pass** on the now-functionally-complete conversation loop: define tokens,
    layout, and accessibility approach; restyle `ThreadView`/`ControlsArea`/STT-and-error UI against
    it (see decisions.md, 2026-07-27).
11. Define core data structures (session state shape, transcript shape) consistent with the state
    model — transcript must exclude the hidden opening instruction.
12. Add evaluation as a second slice once the full v0 conversation loop (steps 4–10) is solid and
    styled.
13. Revisit scenario count for v1, predefined-scenario-starter mode, and turn counter / max-turns,
    once v0 exists.
