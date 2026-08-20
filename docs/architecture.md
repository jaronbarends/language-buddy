# Architecture reference

Dev reference only (not a case-study artifact). Two diagrams: component ownership/render tree, and
the route/API boundary. Keep this file updated alongside decisions.md when structure changes —
Mermaid renders natively on GitHub and in VS Code (with the Mermaid extension), no build step
needed.

**Confidence note:** file _locations_ below are verified against the real tree (2026-08-18); render
relationships (which component renders which) are confirmed by project owner as of this update.

---

## Component tree

```mermaid
graph TD
  Page["chat/page.tsx (Server Component)"] --> Container["ChatContainer.tsx"]

  Container -->|"state: 'setup'"| Setup["ChatSetup.tsx"]
  Container -->|"state: 'conversation'"| Conversation["ChatConversation.tsx"]

  Setup --> SetupForm["chatSetup/components/SetupForm.tsx"]
  SetupForm --> LanguagePicker["LanguagePicker.tsx"]
  SetupForm --> SegmentedControl["SegmentedControl.tsx (CEFR level picker)"]

  Conversation --> Reducer["chatConversation/chatReducer.ts (useReducer)"]
  Conversation --> ThreadView["chatConversation/components/ThreadView.tsx"]
  Conversation --> ControlsArea["ControlsArea.tsx"]
  Conversation --> SpeechToText["SpeechToText.tsx"]
  Conversation --> ErrorArea["ErrorArea.tsx (rendered during 'error' phase)"]
  Conversation --> DevHelper["DevHelper.tsx (dev-only, env-var gated)"]

  ThreadView --> SpeechBalloon["SpeechBalloon.tsx"]
  ThreadView --> Evaluation["Evaluation.tsx (incl. EvaluationLoader)"]

  SpeechToText --> SpeechResults["SpeechResults.tsx (live transcript preview during 'listening')"]

  Setup -.->|"onStartSession(conversationConfig)"| Container
  Conversation -.->|"onEndSession()"| Container
```

Shared components (`src/components/`) used across both branches — not tied to chat specifically:
`Button`, `Loader`, `Feedback`, `Icon`, `PageHeading`, `Logo`, `Header`.

---

## Route / API boundary

```mermaid
graph LR
  Conversation["ChatConversation.tsx"] --> AiService["aiService.ts (sendChatMessage / sendEvaluationRequest)"]

  AiService -->|NEXT_PUBLIC_USE_MOCK_AI=false| ChatRoute["/api/ai/chat"]
  AiService -->|NEXT_PUBLIC_USE_MOCK_AI=false| EvalRoute["/api/ai/evaluation"]
  AiService -->|NEXT_PUBLIC_USE_MOCK_AI=true| MockChatRoute["/api/aiMock/chat"]
  AiService -->|NEXT_PUBLIC_USE_MOCK_AI=true| MockEvalRoute["/api/aiMock/evaluation"]

  ChatRoute --> Gateway["geminiGateway.ts (postToGemini)"]
  EvalRoute --> Gateway

  Gateway --> ConvConfig["conversationConfig.ts (getConversationConfig)"]
  Gateway --> ChatInstruction["getChatBaseInstruction.ts"]
  Gateway --> EvalConfig["evaluationConfig.ts (getEvaluationSystemInstruction)"]
  ChatInstruction --> SharedContext["getSharedInstructionContext.ts"]
  EvalConfig --> SharedContext

  Gateway --> Gemini["Gemini API (@google/genai, previous_interaction_id)"]

  MockChatRoute["/api/aiMock/chat/route.ts"] --> RespondDelay["respondAfterDelay.ts"]
  MockEvalRoute["/api/aiMock/evaluation/route.ts"] --> RespondDelay

  Gateway --> AiResponse["aiResponse.ts (AIEvaluationSchema, Zod validation)"]
```

Notes:

- Both real routes share `geminiGateway.ts`'s call logic; chat and evaluation each build their own
  system instruction, both funneling shared persona context through
  `getSharedInstructionContext.ts` (dedup landed 2026-08-18).
- Mock routes are structurally parallel to real ones (same `AIChatResult` contract) so
  `aiService.ts` doesn't need to know which is active beyond the env flag.
- `AIEvaluationSchema.safeParse` runs client-side (confirmed), not inside the route — the route
  returns raw JSON, validation happens before it reaches `chatReducer.ts`.
