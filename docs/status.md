# Project status

**Last updated:** 2026-08-04
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
update).
**Real TTS output is now wired up and working end-to-end** (2026-07-31–2026-08-01, see
"What exists" and decisions.md): actual build order departed from the plan below — TTS was
picked up before the reply-phase UX redesign.
**Reply-phase UX redesign is now scoped**
(2026-08-04, see decisions.md): `listening` gets `Send`/`Cancel` actions replacing `Stop
listening`, `End session` replaces `End Conversation`/`End this session` everywhere except
`listening`, and `listeningTimedOut` is superseded outright (no app-enforced timeout planned —
recognition stays open by design). Edit, evaluation/`chatEnded`, and auto-start-listening remain
out of scope for this round. Not yet implemented. Next up: build the scoped reply-phase redesign,
then swap the mock AI for the real Gemini route, then the visual/UI design pass, before evaluation.

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
  below) to `sendChatMessage`, dispatches on success/failure, and passes `languageVoice` plus an
  `onAISpeechEnd` handler down to `ThreadView`, which now fires real TTS (see "Real TTS wired up"
  below) instead of the old stubbed `speakAIResponse`/`setTimeout`. `previousInteractionId` is
  tracked in component state and threaded through each call, per Spike 3's finding that context
  (but not `systemInstruction`) carries over via `previous_interaction_id`.
- `ControlsArea.tsx` — derives primary-button label/handler from phase via `canStartWithUser` /
  `canStartReply` / `canSendReply` / `chatHasEnded` / `hasError` helpers in `chatReducer.ts`; "End
  conversation" button always rendered except in `error` (dispatches `STOP_CHAT`, handled from
  every reducer phase — see decisions.md). From `chatEnded`/`error`, the primary button reads "End
  this session" and calls `onEndSession` directly (no dispatch — see "Setup screen" bullet above).
- `ErrorArea.tsx` — renders the raw error message from the `error` phase; unstyled, no
  per-error-type differentiation. Generic error recovery (end-session-only, no Retry) is wired up
  via the `onEndSession` prop call described above, not a reducer action.
- `ThreadView.tsx` — renders `threadItems` from state, styled by author (`ai`/`user`); also owns
  the TTS playback trigger (see "Real TTS wired up" below) via a `useEffect` keyed on
  `phase.status === 'aiTurnSpeaking'`.
- **Derived-state predicates in `chatReducer.ts` (2026-08-03–2026-08-04):** `canSendReply` and
  `hasError` are now type predicates (`phase is Extract<ChatPhase, { status: '...' }>`), narrowing
  `ChatPhase` at the call site instead of requiring a separate raw `phase.status !== '...'`
  comparison before reading a phase-specific field (`state.phase.transcript` in
  `ChatConversation.tsx`, `phase.error` in `ErrorArea.tsx`). Six more plain-boolean helpers
  (`isAITurnSpeaking`, `isWaitingForAI`, `shouldAutoScrollThread`, `chatStartIsPending`,
  `listeningIsStopped`, `isListening`) were added and now used, alongside the existing helpers,
  everywhere a `phase.status` comparison previously appeared inline (`ChatConversation.tsx`,
  `ControlsArea.tsx`, `MockSTT.tsx`, `SpeechResults.tsx`, `SpeechToText.tsx`, `ThreadView.tsx`) —
  see decisions.md.
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
  typing indicator once text has appeared. **Recognition preview shown as a speech balloon
  (2026-08-02):** the preview is now visible across `listening`/`listeningStopped`/
  `listeningTimedOut`/`readyForSendingUserReply` (gated by the new `shouldShowRecognitionPreview`
  helper in `chatReducer.ts`, not just `phase.status === 'listening'`), and is wrapped in a new
  shared `SpeechBalloon.tsx` component (extracted from `ThreadView`'s message-bubble styling, now
  reused by both `ThreadView` and `SpeechResults`) so the in-progress transcript renders as a
  user-style chat bubble instead of a plain status `div` (see decisions.md).
- **AI-pending speech balloon (2026-08-02):** `ThreadView.tsx` shows an ellipsis inside an
  `author="ai"` `SpeechBalloon` while `phase.status === 'waitingForAI'`, indicating the loading
  state while waiting for the AI response. Delayed 500ms (`setTimeout`, cleared/reset on phase
  change) to avoid a flash on fast responses (see decisions.md).
- **Real TTS wired up** (2026-07-31–2026-08-01, see decisions.md): `src/lib/textToSpeech.ts`
  exports `initSpeech(onSuccess, onFail)` (wraps `speechSynthesis.getVoices()`/the
  `voiceschanged` event — Chrome vs. Firefox differ on whether voices are available
  synchronously) and `speakMessage(message, voice, onSpeechEnd)`, which sanitizes whitespace,
  splits the message into sentences (Chrome caps utterance length), queues one
  `SpeechSynthesisUtterance` per sentence, and fires `onSpeechEnd` only on the last one's `end`
  event. `ChatContainer.tsx` calls `initSpeech` on mount, builds a `supportedLanguageVoices` map
  (one voice per supported `languageTag`), derives `languageVoice` for the currently-selected
  `Language`, and calls `unlockSpeechSynthesis()` (speaking an empty utterance synchronously
  inside the "Start conversation" tap handler) — required for iOS Safari to allow audio at all,
  see decisions.md. `ThreadView.tsx`'s `aiTurnSpeaking` effect calls `speakMessage` with the
  voice and dispatches `AI_FINISHED_SPEAKING` (the reducer phase this satisfies already existed
  as a stub — no reducer changes needed). Speech rate is corrected per detected voice engine
  (`google`/`apple`/`microsoft`, sniffed from `voice.voiceURI`) via a hardcoded, empirically
  calibrated `speechRatePairings` lookup table — replacing an earlier, less accurate
  `isIOS()`-based flat multiplier (`src/lib/platform.ts`, now deleted). `speechIsSupported` is
  tracked in `ChatContainer` state but not yet consumed by any component — no UI fallback exists
  yet for "this language has no installed voice" (tracked in backlog.md). Two dev-only files,
  `textToSpeechTest.ts` and `speechRateAnalysis.ts`, hold the calibration tooling/raw timing data
  behind the rate table; neither is imported by any production path (see decisions.md,
  "known dead code" note, and backlog.md for a cleanup item covering these plus the now-orphaned
  `AIThreadItemContent.tsx`).
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
- **`DevHelper` gated behind `NEXT_PUBLIC_SHOW_DEV_HELPER` (2026-08-02):**
  `ChatConversation.tsx` only renders `DevHelper` when that env var is set, instead of always
  rendering it.
- `ChatConversation.tsx` receives a `chatConfig` prop (`ChatConfig`, from `src/lib/chatConfig.ts`)
  built via `getChatConfig(language, scenario)` — built in `ChatSetup.tsx` now, not `page.tsx` (see
  "Setup screen" bullet above; still only the two freeform-chat scenarios, not the scenario
  library, per decisions.md, 2026-07-28/07-30).

## What's decided

- Concept: scenario library from the start (not a single hardcoded scenario)
- Persona: generic friendly acquaintance, not a specific character (see decisions.md). **Topic
  guidance broadened (2026-08-02):** `freeformChatWithAIStart`/`freeformChatWithUserStart` now say
  "a stranger"/"an acquaintance or a stranger" and steer explicitly past smalltalk, superseding the
  original "discussing hobbies or where the user lives" wording — the acquaintance-only framing was
  producing too-shallow topics (see decisions.md). The `scenarios` array's placeholder entry still
  uses the original wording, untouched.
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
- **Real TTS output implemented (2026-07-31–2026-08-01)** — replaces the stubbed
  `setTimeout`/console.log placeholder; wired via `ThreadView`'s `aiTurnSpeaking` effect calling
  `speakMessage` (see "What exists" above and decisions.md). Speech rate is corrected per
  detected voice engine (Google/Apple/Microsoft) using an empirically calibrated lookup table,
  not a per-platform heuristic — the initial `isIOS()`-based flat multiplier was superseded the
  same week once it proved too imprecise. Voice-availability detection per supported language
  exists; the UI fallback for "no voice installed" and a user-facing speech-rate control remain
  open (see below and backlog.md).

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
- `listeningTimedOut` — superseded 2026-08-04, not merely unwired: no app-enforced timeout is
  planned, since `recognitionShouldBeActiveRef` keeps recognition open indefinitely by design and
  `SpeechRecognition` doesn't time out on its own (see decisions.md). If a real need resurfaces,
  it should be scoped fresh against the `Send`/`Cancel` flow, not resumed from the original design.
- **Visual/UI design content** — tokens, layout, component styling, accessibility approach. Timing
  is decided (after the core loop, before evaluation); the actual design.md content doesn't exist
  yet.
- **Predefined-scenario-picks-its-own-starter (freeform-chat "mode 2")** remains out of scope —
  deliberately deferred alongside the setup-screen decision, tracked in backlog.md.
- **TTS UI fallback for unsupported languages** — `speechIsSupported`/per-language voice
  detection exists in `ChatContainer`, but nothing in the UI reacts to it yet (no icon/text-only
  fallback on the language picker, per the relevant backlog item).
- **User-facing speech-rate control** — rate correction so far only normalizes _across voice
  engines_ to a consistent baseline speed; there's no slower/faster control exposed to the user
  (separate backlog item).
- **Dead code from the TTS build** — `AIThreadItemContent.tsx` (orphaned once the speak trigger
  moved to `ThreadView`'s phase-driven effect) and `textToSpeechTest.ts`/`speechRateAnalysis.ts`
  (dev-only calibration tooling, not imported by production code) are still in the tree; a
  cleanup decision (delete vs. keep as documented calibration method) is tracked in backlog.md.
- **Reply-phase UX redesign (2026-08-04)** — `listening` phase `Send`/`Cancel` actions and the
  `End session` relabel are designed but not implemented (see decisions.md and "Next step" #9).

## Next step

1. ~~Define the real `ConversationApiResult` type~~ — done, as `AIChatResult` (see decisions.md).
2. ~~Build the mock implementation against that same type/signature~~ — done
   (`/api/aiMock/chat`, toggled via `NEXT_PUBLIC_USE_MOCK_AI`).
3. ~~Wire the v0 state machine to the mock, drive the full happy-path loop~~ — done: typed input,
   mock AI, full turn loop from `chatStartPending` through `chatEnded` all working.
4. ~~Fix `STOP_CHAT` to be handled from every reducer phase, not just `listening`~~ — done: checked
   once before the phase-specific switch (see decisions.md).
5. ~~Build real error handling: reducer `error` case behavior + Retry action~~ — done:
   end-session-only recovery, an "End this session" control calls `onEndSession` directly
   (no dedicated end-session reducer action); no Retry action for v0 (see decisions.md, 2026-07-27).
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
   7a. ~~Show the recognition preview as a speech balloon, visible beyond just `listening`~~ — done:
   `SpeechBalloon.tsx` shared component, `shouldShowRecognitionPreview` helper (see decisions.md,
   2026-08-02).
8. ~~Wire real TTS output, replacing the `speakAIResponse` console.log/setTimeout stub~~ — done:
   `textToSpeech.ts` (`initSpeech`/`speakMessage`), triggered from `ThreadView`'s `aiTurnSpeaking`
   effect, voice detection/selection in `ChatContainer`, per-voice-engine speech-rate correction,
   and the iOS Safari user-gesture unlock (see decisions.md). UI fallback for unsupported
   languages and a user-facing rate control remain open (see "What's open").
9. **Reply-phase UX redesign — scoped 2026-08-04, not yet implemented** (see decisions.md):
   - `listening` phase: `Stop listening` replaced by two live actions, `Send` (dispatches
     `STOP_LISTENING`, `{ intent: 'send' }`, unchanged downstream flow into `listeningStopped` →
     `readyForSendingUserReply`) and `Cancel` (new `CANCEL_LISTENING` action, straight to
     `readyForUserReply`, no intermediate phase or transcript wait).
   - `End session` label replaces `End Conversation`/`End this session` everywhere except
     `listening` itself — deliberate narrowing of the 2026-07-27 STOP_CHAT-from-every-phase
     guarantee (see decisions.md).
   - **Not in this round:** Edit (reopened for reconsideration, not designed — see decisions.md and
     backlog.md), evaluation/`chatEnded` rename (parked), auto-start-listening after the AI's turn
     (not started).
   - **Superseded as part of this scoping:** `listeningTimedOut` — no app-enforced timeout planned;
     `recognitionShouldBeActiveRef` keeps recognition open indefinitely by design (see decisions.md).
   - **Open verification item before/during implementation:** `recognition.abort()` (needed for
     `Cancel`) vs. `recognition.stop()` cross-browser behavior not yet checked, given the existing
     iOS Safari `onresult`-after-`stop()` quirk found in initial STT integration.
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
