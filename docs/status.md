# Project status

**Last updated:** 2026-08-18
**Current phase:** Early build. Concept locked (scenario-library-based conversational sparring
partner, Norwegian, multi-turn sessions + async structured evaluation). MVP scoping in progress;
Spikes 1–4 all complete. AI provider decided (Gemini). State machine now runs the full happy path
end-to-end against real STT input and the mock AI API, generic error recovery (end-session-only, no
dispatched action) is implemented, and empty-transcript input silently retries rather than
sending/erroring. Ending a session is always a direct `onEndSession` prop call, never a reducer
action — this includes mid-conversation ending, not just from `error`: the `STOP_CHAT` action and
terminal `chatEnded` phase mentioned in earlier updates here were both removed as part of the
2026-08-04 reply-phase redesign (see decisions.md, "Reply-phase UX redesign implemented"). **The
setup screen is now built**: `ChatContainer` renders `ChatSetup` (language + who-starts,
pre-selected defaults) or `ChatConversation` (renamed from `ChatClient`); ending a session is a
direct `onEndSession` prop call from `ChatConversation` to `ChatContainer`. `chatReducer`'s
`chatStartPending` rename and the `END_SESSION` removal are in place (see decisions.md, 2026-07-30).
**Real TTS output is now wired up and working end-to-end** (2026-07-31–2026-08-01, see
"What exists" and decisions.md): actual build order departed from the plan below — TTS was
picked up before the reply-phase UX redesign.
**Reply-phase UX redesign is now implemented** (scoped 2026-08-04, built same day, see
decisions.md): `listening` has `Send`/`Cancel` actions replacing `Stop listening`, `End session`
replaces `End Conversation`/`End this session`, and `listeningTimedOut` is gone (no app-enforced
timeout — recognition stays open by design). Implementation diverged from the scoped design in
four ways caught during a docs-vs-code review, all resolved by keeping the code and correcting the
docs (see decisions.md, "Reply-phase UX redesign implemented"): the terminal `chatEnded` phase and
`STOP_CHAT` action were dropped entirely (ending a session is now always a direct `onEndSession`
call, not a reducer transition — no cleanup behavior was actually lost by this, see decisions.md);
`Cancel` waits on a new `cancellingListening` phase for `recognition.abort()`'s real `onend` rather
than transitioning immediately; the two phases used by Send were finalized as `stoppingListening`/
`sendingUserReply` (not `listeningStopped`/`readyForSendingUserReply` as scoped), with `intent`
still carried on `stoppingListening`; and `End session`/`Cancel` visibility is gated by a shared
`userIsInInputFlow` helper across the whole stop/cancel/send-in-flight window, not `listening`
alone. Edit, evaluation, and auto-start-listening remain out of scope, per the original scoping.
Next up: swap the mock AI for the real Gemini route, then the visual/UI design pass, before
evaluation.
**Starting a conversation now requires browser `SpeechRecognition` support (2026-08-05, see
decisions.md):** `ChatSetup` disables "Start conversation" and shows a fallback message when the
browser has no `SpeechRecognition`/`webkitSpeechRecognition` constructor, via a new
`useSpeechRecognitionIsSupported` hook (`src/lib/speechRecognition.ts`, SSR-safe via
`useSyncExternalStore`). The old in-conversation `onError`/`handleError` path on `SpeechToText` (a
`// TODO decide how to handle non-api errors` stub) is removed — unsupported browsers can no longer
reach a live conversation, so that error can no longer occur there. **Completed:** gating logic,
the SSR/CSR-safe hook, and removal of the old in-conversation error path, merged to `main` via PR
#13 (`25b6fd3`). **Remaining or broken work:** None. **Open questions or decisions:** None — the
SSR/CSR mismatch risk was resolved by switching to `useSyncExternalStore` (see decisions.md,
"SSR/CSR mismatch fix"). **Next step:** None specific to this item; see the project-level "Next
step" list below.
**Visual/UI design pass implemented (2026-08-06–2026-08-09, see decisions.md):** design tokens
(OKLCH color scale, spacing/radii, two self-hosted variable fonts, borders/focus-outline, animation
durations) landed first, then a small shared component set (`Button`, `Loader`, `Feedback`, `Icon`,
`PageHeading`, `Logo`), then restyling of the setup screen (`SegmentedControl` extracted, flag icons

- no-voice warning icon on `LanguagePicker`, `ChatSetup` split into layout chrome + a new
  `SetupForm`) and the conversation loop (chat-style balloons sized to fit-content, `Loader` replacing
  the static AI-pending placeholder). Landed via `visual-design` (PR #14, `497f7da`) plus same-week
  follow-on branches, all merged to `main`. **`ErrorArea` now uses `Feedback` too (2026-08-09)** — the
  conversation-loop error message is no longer a plain unstyled `<div>`; `ErrorArea.module.css` was
  deleted as no-longer-needed (see decisions.md). **Completed:** all of the above, including
  `ErrorArea`. **Remaining or broken work:** no
  accessibility pass beyond what individual new components picked up incidentally (see decisions.md,
  "Known gaps after this pass"). **Next step:** a dedicated accessibility pass (lang attribute,
  aria-live) remains backlog, not scheduled.
  **`Starter` type consolidated into `scenarios.ts` (2026-08-09, see decisions.md):** the duplicate
  `aiHasFirstTurn: boolean` (on `Scenario`/`ChatConfig`) and locally-declared `Starter` type (in
  `SetupForm.tsx`) tracked the same datapoint; `Scenario.starter: Starter` is now the single source,
  with `Starter` exported from `scenarios.ts`.
  **Language level picker added (2026-08-10, see decisions.md):** not a previously-scoped backlog
  item — built directly from two loose backlog ideas. Users pick Beginner (CEFR A1/A2) or
  Intermediate (CEFR B1/B2) in the setup screen (`SetupForm`'s new `SegmentedControl`, defaulting to
  Intermediate); the selected level's `cefrLevel` is threaded through `getChatConfig`/
  `getBaseInstruction` into the AI's system instruction. A third level (Expert/C1/C2) was drafted
  then pulled back out before committing — deliberately postponed, not shipped.
  **Freeform scenarios generalized into an array; scenario-driven opening hint added (2026-08-11, see
  decisions.md):** `scenarios.ts` now exports `freeformScenarios: Scenario[]` (the two freeform
  scenario objects, now private consts) instead of exporting `freeformChatWithAIStart`/
  `freeformChatWithUserStart` individually. `Scenario` gains `initiallySelected?: boolean` (set on the
  AI-starts variant) and `openingHint?: string` (set only on the user-starts variant — "Ask a
  question or name a topic you want to discuss"). `ChatContainer` now owns `scenario` state, seeded
  via a new `getInitialScenario()` that finds the `initiallySelected` entry in `freeformScenarios`;
  `ChatSetup`/`SetupForm` receive it as `freeformScenarios`/`selectedScenario`/`onChangeScenario`
  props instead of `SetupForm` holding its own local `starter` state. `openingHint`, when set on the
  selected scenario, is threaded through `ChatContainer` → `ChatConversation` → `ThreadView` and
  rendered as a new `Feedback type="info"` banner at the top of the thread when present. The
  prop/state name is deliberately `selectedScenario`, not `selectedFreeformScenario` — anticipated to
  hold either a freeform or a future closed scenario once closed scenarios exist, which will need a
  different selection mechanism (see backlog.md, "Predefined-scenario-picks-its-own-starter").
  **"Stop chat" brought back; ending a session is a dispatched action again (2026-08-12, see
  decisions.md):** `chatReducer.ts` gains two phases (`chatStopped`, `sessionEnded`) and two actions
  (`STOP_CHAT`, `END_SESSION`) — reversing the 2026-08-04 removal of `STOP_CHAT`/`chatEnded`, under new
  names and a changed two-step shape (stop, then a separate end-session step). `ControlsArea` now shows
  a "Stop chat" secondary button (`canStopChat`) alongside the existing "End session" secondary button
  (`shouldShowEndSessionButton`, renamed from `shouldShowStopButton`) wherever neither is excluded — a
  new 3-area CSS grid in `ControlsArea.module.css` lays out both when they're both visible. Once
  stopped, both secondary buttons disappear and the primary button becomes "End this session"
  (dispatches `END_SESSION`). Ending a session (from `chatStopped`, from the normal flow, and from
  `error`) is no longer a direct `onEndSession()` prop call from `ControlsArea` — it dispatches
  `END_SESSION`, and a new `ChatConversation` effect keyed on `phase.status === 'sessionEnded'` calls
  the real `onEndSession` prop as a side effect. A second new effect, keyed on `chatStopped`/
  `sessionEnded` (`requestsShouldBeAborted`), aborts any in-flight AI request via the existing
  `abortControllerRef`/`requestIdRef` stale-response guard. **Two issues caught and fixed before this
  was documented as finished, not shipped as originally written** (see decisions.md): `canStopChat`
  initially didn't exclude the `error` phase, so "Stop chat" would have rendered next to "End this
  session" during an error and silently discarded `phase.error` if clicked — fixed by excluding
  `hasError(phase)`. A `shouldShowStopChatButton` helper was added but never wired to anything —
  removed as dead code. `SetupForm`'s submit button is relabeled "Start chat" (was "Start
  conversation"), matching the new "Stop chat" naming. **Not yet built:** the `chatStopped` phase
  currently offers only "End this session" — a future iteration is meant to offer requesting an
  evaluation from there instead (see backlog.md).
  **"Stop chat" superseded two days later; evaluation shipped instead (2026-08-13–2026-08-14, see
  decisions.md):** the above paragraph describes what shipped 2026-08-12 — it's no longer current.
  `chatStopped`/`STOP_CHAT`/`canStopChat` are all gone from the code as of the `add-phase-stages`
  branch (merged `aa74377`). Ending a session is once again a single step: `END_SESSION` goes straight
  to a new `sessionEndRequested` phase, no intermediate stop phase. `ControlsArea` was rebuilt around a
  `ChatStage` abstraction (`getChatStage(phase)`, `buttonsByStage`, `buttonConfig`,
  `buttonIsDisabled` — see decisions.md, "`ControlsArea` button config refactor") in the same pass that
  added the evaluation feature's own "Evaluate" secondary button; "Stop chat" simply didn't reappear
  once the button set was rebuilt — not a documented decision to drop it, see decisions.md for the
  caveat. **Evaluation now has a first working implementation** (mock-backed, plain-text output, not
  yet the structured grammar/vocab/nuance fields requirements.md scopes) — see "What exists" below and
  decisions.md, "Evaluation: first working implementation," for the full shape.
  **Evaluation output is now structured, not plain text (2026-08-16, branch
  `structured-evaluation-output`, see decisions.md, "Structured evaluation output implemented"):** the
  AI's evaluation reply is now schema-shaped JSON (`comments` made of typed `segments` —
  `'text'`/`'userInput'`/`'suggestion'`, `src/lib/aiResponse.ts`), enforced server-side via Gemini's
  `response_format` (a JSON Schema derived from the same Zod schema via `z.toJSONSchema`) and
  validated client-side via `AIEvaluationSchema.safeParse` before it reaches the reducer — the first
  place this app runtime-validates LLM-generated JSON, closing a gap flagged since 2026-07-25.
  `Evaluation.tsx` now renders comments as a list of inline-styled segments (quoted user input and
  suggested replacements get distinct styling) instead of one plain-text block. The real AI route
  split back into `/api/ai/chat`/`/api/ai/evaluation` (reversing the 2026-08-14 route-generalization)
  since evaluation now needs its own request contract (`previousInteractionId` required) and its own
  `response_format`; the shared Gemini-calling logic moved to a new `src/lib/geminiGateway.ts` instead
  of living in one shared route. The `sendMessageToAI_OLD` dead code flagged 2026-08-14 is deleted.
  **Not fixed by this round:** no loading indicator during `waitingForEvaluation`,
  `Evaluation.module.css` still missing `.evaluationContent`, and real (non-mocked) evaluation calls
  remain unverified live — see "What's open" below.
  **Evaluation-request gating tightened; abort-ordering race fixed (2026-08-17, PR #29
  `evaluation-permission`, see decisions.md, "Evaluation permission gating"):** `canRequestEvaluation`
  now also takes `messageCount` (`state.threadItems.length`, threaded through `ControlsArea`) and
  additionally requires `messageCount > 1` — the phase-only check (`aiTurnSpeaking`/
  `readyForUserReply`) didn't distinguish "AI has replied at least once, so `previousInteractionId`
  exists" from an earlier point in either starter scenario where it doesn't yet, so "Evaluate" could
  otherwise enable too early. `ChatConversation.tsx`'s abort-in-flight-request `useEffect` was also
  reordered to run before the chat-start effect, and the reasoning for excluding
  `requestEvaluation` from `requestsShouldBeAborted` (already true in code) was written up as an
  explicit warning comment rather than left as a commented-out line. Mock chat route's response
  `id` changed from a static literal to `crypto.randomUUID()`, so `previousInteractionId` looks
  realistic during mock dev.
  **Evaluation loading indicator added; AI-pending balloon reworked into an animated thread item
  (2026-08-18, PRs #30/#31, see decisions.md):** two small features, both merged same day. **PR #30
  ("evaluation loading state"):** a new `isWaitingForEvaluation(phase)` helper drives a new
  `EvaluationLoader` (in `Evaluation.tsx`, alongside the existing `Evaluation` component) rendered by
  `ThreadView.tsx` during `waitingForEvaluation` — closes the loading-indicator gap open since
  2026-08-14/08-16. **PR #31 ("balloon animation"):** supersedes the old AI-pending-balloon mechanism
  described just above under "Evaluation output is now structured" and, further up, under
  "AI-pending speech balloon (2026-08-02)" — that mechanism (a 500ms-delayed boolean rendering a
  separate `Loader`-only balloon outside `threadItems`) is gone. The pending indicator is now a real
  `ThreadItem` (`ChatMessageItem.isPending?: boolean`), pushed into `threadItems` when a wait-for-AI
  phase starts and updated in place once the reply arrives, instead of being appended as a new item —
  one balloon now visually morphs from loader-sized to message-sized rather than one element
  disappearing and a different one appearing. `SpeechBalloon`/`ThreadView` both gained a bounce/
  fade-in entrance animation (new `--duration-fast`/`--overshoot-out` tokens) with the AI balloon's
  entrance offset 500ms after the user's, for a sense of sequentiality. New tokens added at the
  settings layer: `--duration-fast`, `--overshoot-out`, `--border-width-default`, and four
  `--loader-*` size tokens used to size the pending balloon exactly to the `Loader` component's real
  dimensions (see decisions.md for the full token list). **Not touched by either PR:**
  `Evaluation.module.css`'s missing `.evaluationContent` class, and live (non-mocked) verification of
  evaluation — both still open, see "What's open" below.
  **Persona context deduplicated; `chatConfig`/`systemInstruction` renamed (2026-08-18, see
  decisions.md):** the persona-level `## Context` block `getBaseInstruction.ts` and
  `evaluationConfig.ts` each independently built (duplicating the ASR transcription-error caveat
  verbatim) is now one shared `getSharedInstructionContext.ts`, called by both. This also fixes a real
  gap, not just dedup: the hidden `aiStartingPrompt` trigger-message exclusion previously existed only
  in `evaluationConfig.ts` — it now applies to the live chat system instruction too. A duplicate
  `## Context` heading bug introduced mid-extraction (heading emitted both by the shared function and
  by each caller) was caught and fixed same session — the shared function now returns only the bullet
  content, not the heading, so each caller's own `## Context` heading also stays free to hold
  non-shared context later. Separately, `src/lib/chatConfig.ts` → `conversationConfig.ts`
  (`ChatConfig`/`getChatConfig` → `ConversationConfig`/`getConversationConfig`, all `chatConfig` vars
  renamed to `conversationConfig` at every call site), `getBaseInstruction.ts` →
  `getChatBaseInstruction.ts`, and `ConversationConfig.systemInstruction` → `chatSystemInstruction`
  (mirroring `evaluationSystemInstruction`).

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
  - `freeformScenarios` (`src/lib/scenarios.ts`) — a `Scenario[]` holding two private-const
    `Scenario` objects (`freeformChatWithAIStart`/`freeformChatWithUserStart`, no longer
    individually exported as of 2026-08-11, see decisions.md) outside the `scenarios` array,
    differing in `title`, `instruction` text, `starter`, and (AI-starts variant only)
    `initiallySelected`/(user-starts variant only) `openingHint`. `Starter` (`'ai' | 'user'`) is
    defined in `scenarios.ts` and imported by `SetupForm.tsx` (renamed from `aiHasFirstTurn:
boolean`, 2026-08-09 — see decisions.md). `ChatContainer` owns the selected scenario as
    `scenario` state (prop name `selectedScenario` downstream), not `SetupForm` — see "Freeform
    scenarios generalized into an array" above.
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
- `chatReducer.ts` — 14-state discriminated union (`chatStartPending`, `waitingForAI`,
  `aiTurnSpeaking`, `readyForUserStart`, `readyForUserReply`, `listening`, `stoppingListening`,
  `cancellingListening`, `sendingUserReply`, `requestEvaluation`, `waitingForEvaluation`,
  `evaluation`, `sessionEndRequested`, `error`). **Current as of 2026-08-14** (see decisions.md,
  "'Stop chat' superseded by the `ChatStage` refactor" and "Evaluation: first working
  implementation") — this supersedes the 2026-08-12 `chatStopped`/`sessionEnded` shape described
  further down this doc: those two phases and the `STOP_CHAT` action are gone again, two days after
  being added. `END_SESSION` is unconditional (any phase → `sessionEndRequested` directly, no
  intermediate stop step) and, along with `ERROR`/`REQUEST_EVALUATION`, is checked at the top of the
  reducer before the phase-specific switch. Three new phases back the evaluation feature:
  `requestEvaluation` (guarded by `canRequestEvaluation` — only reachable from `aiTurnSpeaking`/
  `readyForUserReply`) → `waitingForEvaluation` → `evaluation` (terminal, like `sessionEndRequested`).
  A new `ChatStage` type (`'aiTurnFlow' | 'userTurnFlow' | 'evaluation' | 'error' | 'sessionEnded'`)
  and `getChatStage(phase)` bucket every phase into one of five stages via an exhaustive switch — this
  is now what `ControlsArea` renders from (see below) and what `userIsInInputFlow` is defined in terms
  of. Reducer covers the full happy-flow transitions (`chatStartPending` →
  `readyForUserStart`/`waitingForAI` → `aiTurnSpeaking` → `readyForUserReply` → `listening` →
  `waitingForAI` → ...), looping until `END_SESSION`/`REQUEST_EVALUATION` is dispatched from outside
  that happy-flow switch. `ThreadItem` is now a union (`ChatMessageItem | EvaluationItem`) instead of
  a single shape, discriminated by a new `type` field.
- `ChatConversation.tsx` (Client Component, see "Setup screen" bullet above) owns the `useReducer`
  and drives the loop end-to-end: sends the transcript from real STT (`SpeechToText.tsx`, see
  below) to `sendChatMessage`, dispatches on success/failure, and passes `languageVoice` plus an
  `onAISpeechEnd` handler down to `ThreadView`, which now fires real TTS (see "Real TTS wired up"
  below) instead of the old stubbed `speakAIResponse`/`setTimeout`. `previousInteractionId` is
  tracked in component state and threaded through each call, per Spike 3's finding that context
  (but not `systemInstruction`) carries over via `previous_interaction_id`.
- **`ControlsArea.tsx` rebuilt around `ChatStage` (2026-08-14, see decisions.md, "`ControlsArea`
  button config refactor")** — supersedes the 2026-08-12 shape described just above (`canStopChat`/
  `shouldShowEndSessionButton`/etc. no longer exist). Buttons are now driven by three lookup tables
  instead of per-button visibility functions: `buttonsByStage: Record<ChatStage, Partial<Record<
'primary' | 'secondary' | 'tertiary', ButtonId>>>` decides which buttons show in which stage —
  `aiTurnFlow: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' }`, `userTurnFlow: {
primary: 'send', secondary: 'cancel' }`, `evaluation`/`error`: `{ primary: 'endSession' }`,
  `sessionEnded: {}`; `buttonConfig` holds each button's static label/handler; `buttonIsDisabled`
  is the only remaining per-status logic (`speak` needs `canSpeak`, `send` needs `canRequestSend`,
  `cancel` needs `canRequestCancel`, `evaluate` needs `canRequestEvaluation`; `endSession` is never
  disabled). The `speak` button's label still special-cases to "Start conversation" when
  `isReadyForUserStart(phase)`, vs. "Reply" otherwise. `ControlsArea.module.css` uses named grid
  areas (`primary`/`secondary`/`tertiary`) with `&:has(:nth-child(3))` switching to a 3-button layout
  only when a third button is present, replacing the old plain two-column grid. Net effect for the
  user: during a normal AI-turn pause, up to three buttons can show — "Reply"/"Start conversation"
  (primary), "Evaluate" (secondary, enabled once the AI has replied), "End session" (tertiary, always
  enabled). During `listening`/`stoppingListening`/`cancellingListening`/`sendingUserReply`
  (`userTurnFlow` stage), only "Send"/"Cancel" show — no end-session option mid-input, same gating
  `userIsInInputFlow` always provided, now expressed as `getChatStage(phase) === 'userTurnFlow'`.
- `ErrorArea.tsx` — renders the error message from the `error` phase via the `Feedback` component
  (2026-08-09, see decisions.md); no per-error-type differentiation. Generic error recovery
  (end-session-only, no Retry) is wired up via the `onEndSession` prop call described above, not a
  reducer action.
- `ThreadView.tsx` — renders `threadItems` from state, styled by author (`ai`/`user`); also owns
  the TTS playback trigger (see "Real TTS wired up" below) via a `useEffect` keyed on
  `phase.status === 'aiTurnSpeaking'`. **Renders evaluation items too, as of 2026-08-13–2026-08-14**
  (see below) — branches on `item.type` (`'message'` → `SpeechBalloon`, `'evaluation'` → the new
  `Evaluation` component); `shouldAutoScrollThread` now also fires on `phase.status === 'evaluation'`.
- **Evaluation: first working implementation (2026-08-13–2026-08-14, see decisions.md, "Evaluation:
  first working implementation"):** an "Evaluate" secondary button (`ControlsArea`, `aiTurnFlow`
  stage — see above) dispatches `REQUEST_EVALUATION`, walking `requestEvaluation` →
  `waitingForEvaluation` → terminal `evaluation` through the reducer. `ChatConversation.tsx`'s
  `sendMessageToAI`/new `sendEvaluationRequestToAI` are both thin wrappers around a shared `sendToAI`
  helper — the abort-controller/stale-request/error-dispatch plumbing that used to live only in the
  chat-send path is now shared between chat turns and the evaluation request. The evaluation call
  reuses the ongoing `previousInteractionId` (continuing the same Gemini interaction, not resending
  the transcript) with its own system instruction/input from a new `src/lib/evaluationConfig.ts`
  (`getEvaluationSystemInstruction`/`getEvaluationInput`, threaded onto `ChatConfig` via
  `getChatConfig` as `evaluationSystemInstruction`/`evaluationInput`). The AI reply renders inside a
  new `Evaluation.tsx` component (`src/app/chat/chatConversation/components/`). **Superseded
  2026-08-16 — see the "Structured evaluation output implemented" bullet below:** the plain-text
  output, the `sendMessageToAI_OLD` dead code, and the `AIRole`-based shared route this bullet
  originally described are all gone. **Still true from this bullet:** the reducer walk
  (`requestEvaluation` → `waitingForEvaluation` → `evaluation`), the "Evaluate" button placement, and
  reusing `previousInteractionId` rather than resending the transcript.
- **Structured evaluation output implemented (2026-08-16, branch `structured-evaluation-output`, see
  decisions.md, "Structured evaluation output implemented"):** the evaluation payload is now
  schema-shaped JSON, not plain text — `AIEvaluationSchema` (`src/lib/aiResponse.ts`, Zod):
  `{ comments: [{ segments: [{ type: 'text' | 'userInput' | 'suggestion', text }] }] }`. Gemini's
  `response_format` (JSON Schema derived from the same Zod schema via `z.toJSONSchema`) constrains the
  model's output server-side; `aiService.ts`'s `toAIEvaluationResult` then runs
  `AIEvaluationSchema.safeParse` on the parsed response before it reaches the reducer, failing closed
  (a generic `AIError`) on a schema mismatch instead of passing malformed data through — the first
  runtime validation of LLM-generated JSON in this app, closing a gap flagged since 2026-07-25.
  `Evaluation.tsx` renders `comments` as a list, each comment's `segments` as inline `<span>`s styled
  by type (`userInput`/`suggestion` get distinct styling in `Evaluation.module.css`) instead of one
  plain-text block. The commented-out `sendMessageToAI_OLD` function (flagged 2026-08-14) is deleted.
  **Still open, not touched by this round:** no loading indicator during `waitingForEvaluation`;
  `Evaluation.module.css` still has no `.evaluationContent` class for the content `<div>`
  `Evaluation.tsx` applies it to; real (non-mocked) evaluation calls remain unverified live — both the
  2026-08-14 "does carried-over interaction history give enough context" risk and a new one, "does
  `response_format` reliably produce schema-conformant output from `gemini-3.1-flash-lite`," are open
  (see decisions.md, "Known risk, still open").
- **Real/mock API routes reorganized again — split back per role (2026-08-16, see decisions.md,
  "Request/response types and routes split per role again"):** supersedes the 2026-08-13–2026-08-14
  route-generalization described just below. The real route is split back into
  `src/app/api/ai/chat/route.ts` and `src/app/api/ai/evaluation/route.ts`, each with its own Zod
  request schema (`AIChatRequestBodySchema` — `previousInteractionId` optional;
  `AIEvaluationRequestBodySchema` — required) and only the evaluation route setting `response_format`.
  The shared Gemini-calling logic (auth, model, `interactions.create`, error normalization) moved out
  of the route file into a new `src/lib/geminiGateway.ts`'s generic `postToGemini<T>`, called by both
  routes — so the "one implementation, not duplicated per role" goal from the 2026-08-14 merge still
  holds, just relocated. `aiService.ts`: `sendAIRequest(params, aiRole)`/`AIResult`/`AIRole` are gone,
  replaced by `sendAIChatRequest`/`sendAIEvaluationRequest` returning `AIChatResult`/
  `AIEvaluationResult` respectively.
- **Real/mock API routes reorganized (2026-08-13–2026-08-14, see decisions.md, "Real AI route
  generalized; mock routes stay split per role"):** **Superseded 2026-08-16, see bullet above** — kept
  here for history. The real route moved from
  `src/app/api/ai/chat/route.ts` to `src/app/api/ai/route.ts` — one generic endpoint shared by both
  chat and evaluation calls, since Gemini itself doesn't distinguish "roles," only the
  `systemInstruction`/`input` content differs. Its local request-body type moved out to a shared
  `src/lib/aiRequest.ts` (`AIRequestParams`). `aiService.ts`: `sendChatMessage` → `sendAIRequest(params,
aiRole)` (`AIRole = 'chat' | 'evaluation'`), `AIChatResult` → `AIResult` — `aiRole` only affects
  which _mock_ endpoint is hit; both mock and real chat/evaluation traffic share `/api/ai` once mocking
  is off. The mock side stays split into two files (`src/app/api/aiMock/chat/route.ts`, new
  `src/app/api/aiMock/evaluation/route.ts`) so chat and evaluation scenarios can be dev-toggled
  independently, sharing an extracted `respondAfterDelay` helper (`src/app/api/aiMock/
respondAfterDelay.ts`). **Dev convenience added same round:** both mock routes now treat a literal
  `input === 'error'` as a request to force their `notFoundError` (404) scenario, regardless of the
  hardcoded `scenario` const — lets error-state UI be triggered on demand (e.g. via `MockSTT`'s dev
  textarea) without editing code.
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
- **Real STT wired up** (`SpeechToText.tsx`), per the 2026-07-28 design: starts/stops/aborts Web
  Speech API recognition keyed off `phase` (`listening` → start, `stoppingListening` → `stop()`,
  `cancellingListening` → `abort()`, the latter reporting back via a new `onListeningCancelled`
  prop once `onend` fires — see decisions.md, "Reply-phase UX redesign implemented"). With
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
  (2026-08-02):** the preview is visible across `listening`/`stoppingListening`/`sendingUserReply`
  (gated by the `shouldShowRecognitionPreview` helper in `chatReducer.ts`, not just
  `phase.status === 'listening'` — phase names updated 2026-08-04, see decisions.md, "Reply-phase
  UX redesign implemented"; `listeningTimedOut` dropped out of the gate along with the phase
  itself), and is wrapped in a new
  shared `SpeechBalloon.tsx` component (extracted from `ThreadView`'s message-bubble styling, now
  reused by both `ThreadView` and `SpeechResults`) so the in-progress transcript renders as a
  user-style chat bubble instead of a plain status `div` (see decisions.md).
- **AI-pending speech balloon (2026-08-02).** **Superseded 2026-08-18, see decisions.md, "Pending AI
  message rendered as a real (animated) thread item":** the original mechanism (a 500ms-delayed
  `showAIPendingBalloon` boolean rendering a standalone `Loader`-only `SpeechBalloon` outside
  `threadItems`) is gone. The pending indicator is now `ChatMessageItem.isPending`, a real
  `ThreadItem` pushed into `threadItems` when waiting for AI starts and updated in place — not
  replaced — once the reply arrives, with a bounce/fade-in entrance animation. See "Evaluation
  loading indicator added; AI-pending balloon reworked" above.
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
  "known dead code" note, and backlog.md for a cleanup item covering these). The once-orphaned
  `AIThreadItemContent.tsx` mentioned in earlier versions of this doc was actually deleted back on
  2026-08-04 (see decisions.md) — corrected 2026-08-18, it isn't dead code still sitting in the tree.
- **`SpeechRecognition` support gating (2026-08-05, see decisions.md):** `src/lib/speechRecognition.ts`
  exports `speechRecognitionIsSupported()`/`getCrossBrowserSpeechRecognition()` (SSR-safe via a
  `typeof window === 'undefined'` guard) and `useSpeechRecognitionIsSupported()` (a
  `useSyncExternalStore` wrapper, needed because `ChatSetup` renders inside a Server Component tree
  and a direct function call would mismatch between the SSR pass and client hydration). `ChatSetup`
  uses the hook to disable "Start conversation" and show a fallback message when unsupported.
  `SpeechToText.tsx`'s `initSpeechRecognition` now returns `SpeechRecognition | undefined` instead of
  throwing; the existing `?.` optional chaining on `recognitionRef.current` already made
  start/stop/cancel safe no-ops against `undefined`. Distinct from the unrelated
  `speechSupportIsChecked` flag (TTS voice detection, owned by `ChatContainer`) despite the similar
  name.
- `next.config.ts` sets `allowedDevOrigins: ['*.ngrok-free.app']`, letting the Next.js dev
  server accept requests tunneled through ngrok (see decisions.md, 2026-07-29).
- **Empty-transcript handling:** new `TRANSCRIPT_EMPTY` action. When neither real STT nor the
  `MockSTT` fallback produces a transcript, `ChatConversation.tsx` dispatches `TRANSCRIPT_EMPTY` in
  addition to `TRANSCRIPT_CREATED`; the reducer sends `stoppingListening` straight back to
  `readyForUserReply` (silent retry — no error, nothing sent) rather than into `sendingUserReply`
  with an empty string (see decisions.md, 2026-07-29; phase renamed 2026-08-04). The same
  fallthrough also fires for any non-`'send'` `intent` on `stoppingListening` — currently only
  `'send'` is ever dispatched, but see decisions.md's "known gap" note on the dormant `'edit'`
  intent value and the backlog item it's tracked against.
- **Working happy flow:** user-opens-first path (`starter: 'user'`), full turn loop via
  real STT input and the mock AI API, confirmed running end-to-end.
- Spike code for STT/TTS exists on branch `spike-speech-to-text` (spike-only, not production code).
- **Visual/UI design pass implemented (2026-08-06–2026-08-09, see decisions.md):**
  - **Design tokens** in `src/styles/settings/`: `colors.css` (three 11-step OKLCH primitive ramps —
    pink/blue/gray — feeding semantic `--color-text-*`/`--color-bg-*`/`--color-border-*` tokens, then
    a further component-role tier), `sizes.css` (spacing + radius scales), `fonts.css`/`type.css`
    (two self-hosted variable fonts — Baloo 2 for display/heading/button, Work Sans for body/label —
    plus semantic font-family/weight/line-height tokens), `borders.css` (border-width, a
    `--focus-outline` shorthand, bevel tokens), `animation.css` (two duration tokens). Follows the
    project's closed-token-scale rule (CLAUDE.md); component CSS reads semantic/component tokens, not
    raw values.
  - **New shared components** in `src/components/`: `Button` (`primary`/`secondary`/`feedback`
    variants, renders a `Link` when given `href`), `Loader` (three-dot indicator, `role="status"`,
    required `ariaLabel`), `Feedback` (typed inline banner + `Icon`, only `type="error"` wired so
    far), `Icon`/`getIconByName` (name-keyed registry mixing `react-icons/fa6` glyphs and six inline-
    SVG flag icons via `@svgr/webpack`, plus `getFlagIconName(languageTag)`), `PageHeading`/`Logo`.
  - **Setup screen restyled:** the inline starter radio pair is now a generic, reusable
    `SegmentedControl<T>` (`src/app/chat/chatSetup/components/SegmentedControl.tsx`) with an animated
    selection indicator. `LanguagePicker` now shows a flag icon per language and a `volumeMute`
    warning icon next to any language with no detected TTS voice (resolves the "voice-availability
    detection exists but nothing reacts to it" backlog item — see backlog.md). `ChatSetup.tsx` is
    split into layout chrome (renders `PageHeading` only) + a new `SetupForm.tsx`
    (`src/app/chat/chatSetup/components/SetupForm.tsx`) that owns the actual form, `starter` state,
    and the speech-recognition-unsupported `Feedback` message.
  - **Conversation loop restyled:** chat balloons (`SpeechBalloon`) sized to fit-content; the
    `waitingForAI` pending balloon now renders `Loader` instead of static placeholder content.
  - **`languages.ts` gets an `initiallySelected` field** (Norwegian is now the explicit default,
    replacing the implicit "`supportedLanguages[0]`" convention) plus a dev-only
    `NEXT_PUBLIC_INITIAL_LANGUAGE_DUTCH` override.
  - **`ErrorArea` now uses `Feedback` too (2026-08-09)** — see decisions.md. `ErrorArea.module.css`
    was deleted as no-longer-needed.
  - **Not done by this pass:** no dedicated accessibility pass — see decisions.md, "Known gaps after
    this pass," and backlog.md's `lang` attribute / `aria-live` items, both still open.
- **`DevHelper` gated behind `NEXT_PUBLIC_SHOW_DEV_HELPER` (2026-08-02):**
  `ChatConversation.tsx` only renders `DevHelper` when that env var is set, instead of always
  rendering it.
- `ChatConversation.tsx` receives a `conversationConfig` prop (`ConversationConfig`, from
  `src/lib/conversationConfig.ts` — renamed 2026-08-18 from `chatConfig`/`ChatConfig`, see
  decisions.md) built via `getConversationConfig(language, languageLevel, scenario)` — built in
  `ChatSetup.tsx` now, not `page.tsx` (see "Setup screen" bullet above; still only the two
  freeform-chat scenarios, not the scenario library, per decisions.md, 2026-07-28/07-30).
- **Language level picker (2026-08-10, see decisions.md):** `language.ts` exports
  `LanguageLevelName`/`LanguageLevel`/`languageLevels`/`getLanguageLevelByName`. `languageLevels`
  holds two entries — Beginner (`A1/A2`), Intermediate (`B1/B2`); Expert (`C1/C2`) was drafted then
  deliberately left out. `ChatContainer` owns `level` state (default: Intermediate), passed as
  `selectedLevel`/`onChangeLevel` through `ChatSetup` → `SetupForm`, rendered as a
  `SegmentedControl`. `level.cefrLevel` flows into `getConversationConfig` → `getChatBaseInstruction`
  (renamed 2026-08-18 from `getChatConfig`/`getBaseInstruction`, see decisions.md), which writes it
  directly into the AI's system instruction.

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
  implemented)** — user-starts/AI-starts variants, reusing the existing `Scenario` type and
  instruction text unchanged (see decisions.md). **Update (2026-08-11):** the two objects are now
  private consts exported together as `freeformScenarios: Scenario[]`, and `ChatContainer` (not
  `ChatSetup`/`SetupForm`) owns which one is selected, as `selectedScenario` — naming chosen to
  anticipate closed scenarios reusing the same state slot later (see decisions.md, "Freeform
  scenarios generalized into an array").
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
  exists; a user-facing speech-rate control remains open (see below and backlog.md). **UI fallback
  for "no voice installed" implemented 2026-08-07** — `LanguagePicker` now shows a `volumeMute`
  warning icon next to any language with no detected voice (see "What exists" above).
- **Visual/UI design pass implemented (2026-08-06–2026-08-09)** — design tokens (colors, spacing,
  fonts, borders, animation durations), a shared component set (`Button`, `Loader`, `Feedback`,
  `Icon`, `PageHeading`, `Logo`), and restyling of the setup screen and conversation loop. Resolves
  the "timing decided, content open" status this had carried since 2026-07-27 (see decisions.md,
  "Visual/UI design phase sequenced after core loop" and the new "Visual/UI design pass" section).
  `ErrorArea` now uses `Feedback` too (2026-08-09, see decisions.md). A dedicated accessibility pass
  is not part of this pass — still open (see "What's open" below).
- **Language level: user can pick Beginner or Intermediate (2026-08-10, implemented)** — not a
  scoped backlog item, built directly (see decisions.md). CEFR level is threaded into the AI's
  system instruction; manually confirmed to change model behavior meaningfully between the two
  levels, no automated check exists yet. Expert (C1/C2) deliberately postponed, not scaffolded in
  code (see decisions.md).
- **"Stop chat" brought back; ending a session is a dispatched `END_SESSION` action again
  (2026-08-12, implemented)** — reverses the 2026-08-04 decision to drop `STOP_CHAT`/`chatEnded`
  entirely and the 2026-07-30 decision that ending a session is a direct `onEndSession()` prop call
  (see decisions.md, "Stop chat brought back... " and "Ending a session is a dispatched `END_SESSION`
  action again"). New `chatStopped` phase offers only "End this session" for now — requesting an
  evaluation from there is planned for a future iteration, not built yet (see backlog.md). Pending AI
  requests are now aborted when the chat is stopped or the session ends (`requestsShouldBeAborted`,
  reusing the existing `abortControllerRef`/`requestIdRef` stale-response guard). A `hasError`
  exclusion bug in `canStopChat` and an unused `shouldShowStopChatButton` helper were both caught and
  fixed during this session, before being documented (see decisions.md).
  **Superseded 2026-08-14 — see below.**
- **`ChatStage` refactor; "Stop chat" dropped again; evaluation feature added (2026-08-13–2026-08-14,
  implemented)** — supersedes the bullet directly above. `chatStopped`/`STOP_CHAT`/`canStopChat` are
  gone; `END_SESSION` now goes directly to a single `sessionEndRequested` phase (see decisions.md,
  "'Stop chat' superseded by the `ChatStage` refactor" — dropping "Stop chat" wasn't a documented,
  deliberate call, just what fell out of rebuilding `ControlsArea` around the new `ChatStage`
  abstraction in the same pass evaluation was added). `ControlsArea` is now driven by
  `getChatStage(phase)` + `buttonsByStage`/`buttonConfig`/`buttonIsDisabled` lookup tables instead of
  per-button visibility functions (see decisions.md, "`ControlsArea` button config refactor," and
  "What exists" above). Evaluation now has a first working, mock-verified, plain-text implementation
  reachable via its own always-available "Evaluate" button, not gated behind stopping/ending the chat
  as backlog.md originally anticipated (see decisions.md, "Evaluation: first working implementation,"
  and "What exists" above for the known gaps in this first pass).
- **Structured evaluation output implemented; API routes split back per role (2026-08-16, branch
  `structured-evaluation-output`, implemented)** — supersedes the plain-text/generalized-route shape
  described in the bullet above. Evaluation output is now `AIEvaluationSchema`-shaped JSON
  (`comments`/`segments`, see decisions.md, "Structured evaluation output implemented"), enforced via
  Gemini's `response_format` and validated client-side via Zod before reaching the reducer — the
  first runtime validation of LLM JSON in this app. Real routes split back into `/api/ai/chat`/
  `/api/ai/evaluation`, sharing Gemini-call logic via a new `src/lib/geminiGateway.ts` rather than one
  generalized route. `sendMessageToAI_OLD` dead code deleted. Not yet done: loading indicator during
  `waitingForEvaluation`, `.evaluationContent` CSS class, live (non-mocked) verification — see "What's
  open" below.

## What's open

- ~~Structured evaluation output fields/depth~~ — implemented 2026-08-16 as a `comments`/`segments`
  schema (not literally grammar/vocabulary/nuance categories — see decisions.md, "Structured
  evaluation output implemented," for why that's a deliberate reading of requirements.md's framing,
  not a literal one). No longer open as a "what should this look like" question. **Still open:**
  whether this shape needs revisiting against requirements.md's original wording, and whether it
  holds up against the real (non-mocked) API — see below.
- ~~Core data structures (session state, evaluation schema)~~ — **done 2026-08-18** (see decisions.md "Core data structures" open item closed)
- ~~Component/route boundary diagram~~ — **done 2026-08-18** (see decisions.md, "Component/route
  boundary diagram added"): `docs/architecture.md`, two Mermaid diagrams (component tree, route/API
  boundary), dev-reference scope. No longer open.
- Scenario count at v1 launch (v0 itself is settled at one hardcoded scenario — this is only about
  what ships after v0)
- - ~~Where `systemInstruction` lives/is re-derived for the full session lifetime~~ — **resolved**,
    outdated as written: `chatSystemInstruction`/`evaluationSystemInstruction` live as fields on
    `ConversationConfig` (`src/lib/conversationConfig.ts`), computed once at session start via
    `getConversationConfig(language, languageLevel, scenario)` in `ChatSetup.tsx`. Per Spike 3's
    finding, Gemini doesn't carry `system_instruction` across turns via `previousInteractionId`, so
    `geminiGateway.ts` resends the relevant instruction string on every request — it isn't
    re-derived per request, just re-sent from the value computed once. No longer open.
- Rate-limit error shape is still doc-sourced only, not empirically confirmed (accepted gap, see
  Spike 4 scope in decisions.md)
- ~~Turn counter / max-turns mechanism~~ — discarded 2026-08-04, not merely postponed; no longer
  open (see decisions.md). The "AI always speaks last" rule (2026-07-26) that depended on it is
  currently unenforced as a result — a session can end via "End session" after any turn, including
  mid-AI-turn, same as before.
- ~~Error UI polish~~ — `ErrorArea` now renders through `Feedback` (2026-08-09, see decisions.md);
  no longer open. No Retry action planned for v0, no per-error-type differentiation — that _policy_
  is unchanged (see decisions.md, 2026-07-27), only the visual styling gap is resolved.
- `listeningTimedOut` — superseded 2026-08-04, not merely unwired: no app-enforced timeout is
  planned, since `recognitionShouldBeActiveRef` keeps recognition open indefinitely by design and
  `SpeechRecognition` doesn't time out on its own (see decisions.md). If a real need resurfaces,
  it should be scoped fresh against the `Send`/`Cancel` flow, not resumed from the original design.
- ~~Visual/UI design content~~ — implemented 2026-08-06–2026-08-09, including `ErrorArea` (see
  "What exists" above and decisions.md, "Visual/UI design pass"); no longer open. The remaining
  accessibility-pass piece is tracked as its own open item below, not under this heading anymore.
- **Predefined-scenario-picks-its-own-starter (freeform-chat "mode 2")** remains out of scope —
  deliberately deferred alongside the setup-screen decision, tracked in backlog.md.
- **Accessibility pass** — beyond what individual components picked up incidentally during the
  visual design pass (`Loader`'s `role="status"`, the no-voice icon's `role="img"`/`aria-label`, the
  pre-existing live-transcript `aria-live`), no dedicated pass has been done. `lang` attribute on
  speech output elements and broader `aria-live` coverage remain open backlog items.
- **User-facing speech-rate control** — rate correction so far only normalizes _across voice
  engines_ to a consistent baseline speed; there's no slower/faster control exposed to the user
  (separate backlog item).
- **Dead code from the TTS build** — `textToSpeechTest.ts`/`speechRateAnalysis.ts` (dev-only
  calibration tooling, not imported by production code) are still in the tree; a cleanup decision
  (delete vs. keep as documented calibration method) is tracked in backlog.md. `AIThreadItemContent.tsx`
  was previously listed here too, incorrectly — **corrected 2026-08-18:** it was actually deleted on
  2026-08-04 (see decisions.md), long before this doc was last touched on this point.
- **Dormant `intent: 'edit'` fallthrough** — `stoppingListening`'s `TRANSCRIPT_CREATED` handler
  only branches explicitly on `intent === 'send'`; any other value falls through into the
  empty-transcript branch and discards the transcript. Inert today (nothing dispatches
  `intent: 'edit'` yet) but needs an explicit branch once Edit is built (see decisions.md,
  "Reply-phase UX redesign implemented", and the STT-edit item in backlog.md).
- ~~Request-evaluation option from `chatStopped`~~ — moot as of 2026-08-14: `chatStopped` no longer
  exists (see decisions.md, "'Stop chat' superseded by the `ChatStage` refactor"), and evaluation
  shipped with its own always-available button instead of being gated behind a stop/end step. No
  longer open.
- ~~Structured evaluation output (grammar/vocabulary/nuance fields)~~ — **implemented 2026-08-16**
  (see decisions.md, "Structured evaluation output implemented," and "What exists" above): a
  `comments`/`segments` Zod schema, enforced via Gemini's `response_format` and validated client-side.
  **Confirmed 2026-08-18 (project owner):** this shape — not three separate grammar/vocabulary/nuance
  fields — was always the intended reading of requirements.md's phrasing; there was never an
  intention to build a literal three-category breakdown. No longer open.
- ~~Runtime-validation approach for LLM JSON (Zod or similar)~~ — **implemented 2026-08-16** alongside
  the above: `AIEvaluationSchema.safeParse` runs on the parsed AI response before it reaches the
  reducer, failing closed on a mismatch (see decisions.md, "TypeScript + planned runtime validation").
  No longer open.
- ~~Evaluation-request loading state~~ — **implemented 2026-08-18** via PR #30 (see decisions.md,
  "Evaluation loading state"): a new `EvaluationLoader`, shown by `isWaitingForEvaluation(phase)`.
  No longer open.
- ~~`Evaluation.module.css` missing `.evaluationContent` class~~ — moot, **corrected 2026-08-18**: the
  `<div className={styles.evaluationContent}>` this referred to no longer exists — `Evaluation.tsx`
  now wraps its output in the pre-existing `styles.evaluation` div directly (see PR #30/#31-era
  `Evaluation.tsx`). Not a fix that landed under this name; the div itself was removed at some point,
  not tracked as its own decision. No longer open.
- ~~Dead code: commented-out `sendMessageToAI_OLD`~~ — **deleted 2026-08-16** as part of splitting
  `sendMessageToAI`/`sendEvaluationRequestToAI` into per-role functions (see decisions.md, "Request/
  response types and routes split per role again"). No longer open.
- ~~Whether real (non-mocked) evaluation calls actually work~~ — **confirmed 2026-08-18 (project
  owner):** yes. Both previously-open unknowns are resolved — Gemini's carried-over interaction
  history gives the model enough context to evaluate the user's turns, and `response_format`
  reliably produces schema-conformant output from `gemini-3.1-flash-lite` (see decisions.md, "Known
  risk, still open"). No longer open.
- ~~Whether dropping "Stop chat" (2026-08-14) was intentional~~ — **confirmed 2026-08-18 (project
  owner):** yes, intentional — it stays dropped, not added back into `buttonsByStage.aiTurnFlow` (see
  decisions.md, "'Stop chat' superseded by the `ChatStage` refactor"). No longer open; also closes
  the corresponding backlog.md item.

## Infra note (2026-08-04–08-05, Next.js 16 → 15 downgrade — merged)

Downgraded `next`/`eslint-config-next` from `16.2.11` to `15.5.22` on branch `nextjs-downgrade`,
**merged to `main` 2026-08-05** (`44c5012`; see decisions.md, "Next.js 16 → 15 downgrade"). Build
and dev server both verified working. Required rewriting `eslint.config.mjs` to use the
`FlatCompat` bridge (v15's `eslint-config-next` ships legacy-format configs, not flat arrays) and
bumping the externally-maintained `@jaronbarends/frontend-tooling-config` package to `1.0.6` to fix
a `@next/eslint-plugin-next` version conflict and a `no-undef`/TypeScript false-positive gap in its
`base.mjs` (see decisions.md for both); `@eslint/eslintrc` was also added as an explicit
devDependency rather than relying on transitive hoisting.

Getting lint to actually run to completion (rather than crash) surfaced further follow-up work, all
now done (see decisions.md, "Downgrade branch merged; lint-now-runs-to-completion follow-up
fixes"): `src/mock/real-chat-response.js` (not valid JS) was deleted; three `react-hooks/
exhaustive-deps` violations were fixed in `ChatConversation.tsx`, `SpeechToText.tsx`, and
`ThreadView.tsx`. The previously-open "build doesn't fail on ESLint errors" note is resolved, not
just worked around — re-tested 2026-08-05 by deliberately injecting a lint error, which now
correctly fails `npm run build` ("Failed to compile."); the original observation turned out to be an
artifact of the two now-fixed/removed error sources, not a real build/lint integration gap.

Two calibration-only files still remain under `spikes/language-speech-rates/`
(`speechRateREsults.ts`, `textToSpeechTest.ts`) — same files already tracked under "What's open" >
"Dead code from the TTS build" below, not new fallout from the downgrade.

## Next step

1. ~~Define the real `ConversationApiResult` type~~ — done, as `AIChatResult` (see decisions.md).
2. ~~Build the mock implementation against that same type/signature~~ — done
   (`/api/aiMock/chat`, toggled via `NEXT_PUBLIC_USE_MOCK_AI`).
3. ~~Wire the v0 state machine to the mock, drive the full happy-path loop~~ — done: typed input,
   mock AI, full turn loop from `chatStartPending` onward working (loops until `onEndSession` is
   called from outside the reducer — see step 9, `chatEnded` no longer exists).
4. ~~Fix `STOP_CHAT` to be handled from every reducer phase, not just `listening`~~ — done: checked
   once before the phase-specific switch (see decisions.md).
5. ~~Build real error handling: reducer `error` case behavior + Retry action~~ — done:
   end-session-only recovery, an "End this session" control calls `onEndSession` directly
   (no dedicated end-session reducer action); no Retry action for v0 (see decisions.md, 2026-07-27).
6. ~~Wire real STT input, replacing the `MockTTS` textarea~~ — done: `SpeechToText` component,
   `stoppingListening` → `sendingUserReply` phases (renamed 2026-08-04, see step 9), transcript
   displayed read-only before send, plus empty-transcript handling (`TRANSCRIPT_EMPTY`) and
   `MockSTT` as a dev-only fallback (see decisions.md, 2026-07-29). `listeningTimedOut` was
   superseded outright rather than built (see step 9) — the stop/send split it was meant to reuse
   is now shared with `Cancel`'s `cancellingListening` phase instead.
7. ~~Build the setup screen extraction~~ — done: `languages.ts`, the two freeform-chat `Scenario`
   objects, `ChatSetup` (+ `LanguagePicker`), `ChatContainer`; `ChatClient` renamed to
   `ChatConversation`; `chatReducer.ts` updated (`chatStartPending` rename, `END_SESSION`
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
9. ~~Reply-phase UX redesign~~ — scoped and built 2026-08-04 (see decisions.md, "Reply-phase UX
   redesign implemented"):
   - `listening` phase: `Stop listening` replaced by two live actions, `Send` (dispatches
     `STOP_LISTENING`, `{ intent: 'send' }`, into `stoppingListening` → `sendingUserReply`) and
     `Cancel` (`CANCEL_LISTENING` → a new `cancellingListening` phase, which waits for
     `recognition.abort()`'s real `onend` — via a new `onListeningCancelled` prop dispatching
     `LISTENING_CANCELLED` — before landing on `readyForUserReply`; not the "no intermediate
     phase" design originally scoped, corrected after implementation).
   - `End session` label replaces `End Conversation`/`End this session`, hidden during the whole
     `listening`/`stoppingListening`/`cancellingListening`/`sendingUserReply` input-flow window
     (via a shared `userIsInInputFlow` helper), not `listening` alone as originally scoped.
   - `STOP_CHAT` action and terminal `chatEnded` phase removed entirely (not just narrowed) —
     ending a session is now always a direct `onEndSession` call. No cleanup behavior was actually
     lost by this (see decisions.md for why). **Superseded 2026-08-12 — see step 14 below:**
     `STOP_CHAT` and a `chatStopped` phase are both back, and ending a session dispatches
     `END_SESSION` again rather than calling `onEndSession` directly.
   - **Not in this round:** Edit (reopened for reconsideration, not designed — see decisions.md and
     backlog.md; the dormant `intent: 'edit'` fallthrough bug is tracked there), evaluation,
     auto-start-listening after the AI's turn (not started).
   - **Superseded as part of this scoping:** `listeningTimedOut` — no app-enforced timeout planned;
     `recognitionShouldBeActiveRef` keeps recognition open indefinitely by design (see decisions.md).
   - `abort()` vs. `stop()` cross-browser behavior: implemented (`cancelListening` uses `abort()`,
     `stopListening` uses `stop()`) but not yet verified against the iOS Safari
     `onresult`-after-`stop()` quirk found during initial STT integration — still an open
     verification item, just no longer blocking implementation.
10. ~~Visual/UI design pass~~ — done, 2026-08-06–2026-08-09: tokens, shared component set, setup-
    screen, conversation-loop, and `ErrorArea` restyling (see decisions.md, "Visual/UI design
    pass"). Not covered: a dedicated accessibility pass — remains open, not blocking evaluation.
11. ~~Core data structures (session state, evaluation schema)~~ — **closed 2026-08-18 (project
    owner), no new types built** (see decisions.md, "'Core data structures' open item closed"): no
    session-state type (nothing persisted, no plan to persist), no transcript type (transcript is a
    plain string; the opening-instruction-exclusion concern this item originally named is stale —
    handled via `previousInteractionId` + `systemInstruction` rules, not an app-side shape), no new
    evaluation type (`AIEvaluationSchema` already existed, done since 2026-08-16). No longer open.
12. ~~Add evaluation as a second slice once the full v0 conversation loop (steps 4–10) is solid and styled~~ — done: first pass 2026-08-13–2026-08-14 (see decisions.md, "Evaluation: first working
    implementation," and step 15 below), structured output completed 2026-08-16 (step 16), with all
    follow-up items resolved by 2026-08-18 (steps 17–18) — no open items remain from this milestone.
    (Earlier phrasing here framed the follow-up as "the structured
    grammar/vocabulary/nuance fields requirements.md scopes" — **corrected 2026-08-18:** there was
    never an intention to build three literal category fields; requirements.md's phrase described
    feedback content, not a required schema shape. See step 17's confirmation.)
13. Revisit scenario count for v1, predefined-scenario-starter mode, and turn counter / max-turns,
    once v0 exists.
14. ~~Bring back "Stop chat"; make ending a session a dispatched action again~~ — done, 2026-08-12
    (see decisions.md, "Stop chat brought back; session-ending moves to a dispatched `END_SESSION`
    action"): `chatStopped`/`sessionEnded` phases, `STOP_CHAT`/`END_SESSION` actions, a second
    secondary button in `ControlsArea` (with a 3-area CSS grid to fit it), pending-request abort on
    stop/end, and the "Start chat" button relabel. Not built yet: offering to request an evaluation
    from `chatStopped` instead of only "End this session" (see "What's open"). **Superseded 2026-08-14
    — see step 15.**
15. ~~Rework `ControlsArea` around `ChatStage`; ship evaluation's first pass~~ — done, 2026-08-13–
    2026-08-14 (see decisions.md, "`ControlsArea` button config refactor" and "Evaluation: first
    working implementation"): `chatStopped`/`STOP_CHAT` from step 14 are gone again — `END_SESSION`
    now goes straight to a single `sessionEndRequested` phase; `ControlsArea` is driven by
    `getChatStage`/`buttonsByStage`/`buttonConfig`/`buttonIsDisabled` instead of per-button
    visibility functions; evaluation got its own always-available "Evaluate" button rather than the
    `chatStopped`-gated design step 14 anticipated. Real/mock AI routes were also reorganized in the
    same round (`/api/ai/chat` → `/api/ai`, shared by chat and evaluation; mock stays split per role
    — see decisions.md, "Real AI route generalized"). Known gaps and open questions from this round
    are tracked in "What's open," not here.
16. ~~Replace plain-text evaluation output with structured output~~ — done, 2026-08-16, branch
    `structured-evaluation-output` (see decisions.md, "Structured evaluation output implemented"):
    `AIEvaluationSchema` (`comments`/`segments`, Zod, `src/lib/aiResponse.ts`), enforced via Gemini's
    `response_format` and validated client-side (`AIEvaluationSchema.safeParse`) before reaching the
    reducer. Real/mock AI routes split back per role (`/api/ai/chat`/`/api/ai/evaluation`, shared
    Gemini-call logic factored into `src/lib/geminiGateway.ts`) — see decisions.md, "Request/response
    types and routes split per role again," which supersedes step 15's route-generalization note
    above. `sendMessageToAI_OLD` dead code deleted.
17. Carried forward from step 16, all now resolved: ~~a loading indicator for
    `waitingForEvaluation`~~ (done 2026-08-18, PR #30 — see step 18); ~~the missing
    `.evaluationContent` CSS class~~ (moot — the div it applied to no longer exists, corrected
    2026-08-18, see "What's open"); ~~live (non-mocked) verification that the
    carried-over-interaction-history assumption and `response_format`'s schema conformance hold
    against the real Gemini API~~ (confirmed 2026-08-18, project owner — both hold); ~~confirmation
    of whether the `comments`/`segments` shape is the intended reading of requirements.md's "grammar,
    vocabulary upgrades, semantic nuance" framing~~ (confirmed 2026-08-18, project owner — yes, this
    shape is intended; no literal three-category breakdown was ever planned). See decisions.md for
    each.
18. ~~Add an evaluation-loading indicator; rework the AI-pending balloon~~ — done, 2026-08-18, PRs
    #30/#31 (see decisions.md, "Evaluation loading indicator; balloon animation & pending-message
    rework"). Everything else carried forward from step 17 is now resolved too (see step 17 and
    "What's open") — no open items remain from the evaluation feature at this point.
