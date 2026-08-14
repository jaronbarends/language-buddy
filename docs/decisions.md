# Decision log

## Concept & scope

### Scenario library from the start

**Decision:** Build as a scenario library (multiple scenarios), not a single hardcoded scenario.
**Rationale:** Preparing/prompting the LLM to hold a persona across a scenario is itself a
deliberate learning goal, not incidental — a single hardcoded scenario wouldn't exercise this.

### Project chosen over alternatives

**Decision:** Built this over language-drill dashboards, dev-tooling dashboards, or a
job-application tracker.
**Rationale:** Genuine personal need (learning Norwegian) — reads as authentic in a case study
rather than manufactured.

### Persona: generic friendly acquaintance, not a specific character

**Date:** 2026-07-17
**Decision:** The AI chat partner is a "generic friendly person" / acquaintance-level relationship,
not a named or richly specified character.
**Rationale:** Simplifies the scenario schema considerably — a scenario becomes "situation + goal +
a few constraints" rather than a full character sheet. Chosen deliberately, not as a shortcut:
persona-holding across a scenario is still a real learning goal, just scoped lighter.

### Voice: STT input is a hard MVP requirement; TTS output is deferred

**Date:** 2026-07-17
**Decision:** The user being able to speak to the app (STT) is required for MVP. The app speaking
back (TTS) is not MVP but should follow shortly after.
**Rationale:** Speaking practice is the core value proposition for a "sparring partner" — text-only
input would undercut the product's premise. TTS adds meaningfully less on the input side and can
follow once the core loop works.

### STT transcript review step: deferred to dev findings

**Date:** 2026-07-17
**Decision:** Not deciding now whether users get to review/correct the STT transcript before it's
sent to the AI. Will observe actual STT accuracy during the spike/build and add a review step only
if needed.
**Rationale:** Avoids over-building a correction UI for a problem that may not materialize.
Flagged as a candidate backlog item regardless of spike outcome.

### Session state: in-memory only for MVP

**Date:** 2026-07-17
**Decision:** Session and evaluation data do not need to survive a page refresh, tab close, or
return visit for MVP.
**Rationale:** Keeps MVP scope minimal; no persistence layer (DB, auth-tied storage) needed to
ship a usable core loop.

### "AI gives tips" = the structured evaluation

**Date:** 2026-07-17
**Decision:** The end-of-session "tips" step and the "structured evaluation (grammar, vocabulary,
nuance)" described in the original concept are the same feature — one name, not two.
**Rationale:** Avoids scope/vocabulary drift between planning docs.

---

## Stack

### Framework: Next.js with App Router

**Decision:** Next.js App Router + TypeScript.
**Rationale:** Route Handlers proxy the LLM so the API key never reaches the client — this is the
actual product need driving the choice. Any further Next.js feature adopted must be justified by a
real product need, not "wanted to learn it." Also a deliberate learning vehicle for Next.js and
TypeScript, both named as ramp-up goals for this project.

### TypeScript + planned runtime validation (Zod or similar)

**Decision:** TypeScript for strict schemas (conversation state, structured evaluation payload).
**Rationale:** Noted explicitly that TS types do not validate untrusted LLM JSON at runtime — a
runtime validator (e.g. Zod) is a separate, necessary decision once the schemas are defined, not
redundant with the types.
**Status:** Not yet implemented — schemas not yet designed.

### AI backend: Google AI Studio / Gemini free tier

**Decision:** Use Gemini's free tier to avoid dev costs.
**Rationale:** Zero-cost development. Explicit tradeoff: free-tier reliability (rate limits, cold
starts) is a real constraint to design around (e.g. middleware quota protection, candidate), not
an edge case to dismiss.
**Status:** Superseded 2026-07-20 — see "Provider & cost decisions" below. The free tier was
abandoned after the actual account dashboard showed a 20 requests/day (RPD) cap for Gemini 2.5
Flash, which blocks normal development, not just edge-case bursts.

---

## Architecture candidates (not yet decided)

Flagged for revisit once MVP scope is fully set — not decided now:

- Streaming responses (Route Handlers + Suspense)
- Static/dynamic rendering split (static scenario library vs. dynamic session pages, ISR)
- Middleware for free-tier quota protection

---

## Spikes (planned, not yet run)

### Spike 1: Gemini scenario coherence

**Question:** Can Gemini (paid tier) hold a lightweight scenario (situation + goal, no rich
persona) coherently across ~5–10 turns without drifting or breaking character, in Norwegian?
**Why it matters:** Directly determines the MVP max-turns limit — this isn't a UX choice until the
technical ceiling is known.
**Date run:** 2026-07-21
**Outcome:** Held cleanly through 10 turns, no drift or character breaks observed. Result judged
good enough to proceed. See "Post-spike-1 decisions" below for what this resolves.

### Spike 2: Browser STT accuracy for Norwegian learner speech

**Question:** How well does the Web Speech API transcribe Norwegian B1/B2 learner speech — accurate
enough to send straight to the LLM, or rough enough that the deferred review step becomes an MVP
requirement immediately?
**Why it matters:** Determines whether the STT review step (currently deferred) needs to move into
MVP scope.
**Date run:** 2026-07-19
**Outcome:** STT accuracy is good enough to send transcription straight to the LLM. TTS output also
turned out to be relatively easy to implement during the spike. See decisions below for how this
resolves the two open items.

---

## Post-spike-2 decisions

### STT transcript review step: not needed for MVP

**Date:** 2026-07-19
**Decision:** No transcript review/edit step before sending STT output to the AI.
**Rationale:** Spike 2 showed Web Speech API accuracy for Norwegian B1/B2 learner speech is good
enough to send straight to the LLM. This resolves the deferred decision from 2026-07-17 — the
condition that would have pulled this into MVP (poor accuracy) did not materialize.

### TTS output moved into MVP scope

**Date:** 2026-07-19
**Decision:** TTS (the app speaking its responses) is now part of MVP scope, not deferred.
**Rationale:** Supersedes the 2026-07-17 decision. Spike 2 showed TTS is relatively easy to
implement, and it meaningfully improves UX for a speaking-practice product. Given the low
implementation cost and high UX value, it belongs in MVP rather than "shortly after."

---

## Provider & cost decisions (pre-Spike 1)

### Gemini free tier abandoned as dev/runtime baseline

**Date:** 2026-07-20
**Decision:** Stop relying on Gemini's free tier, including for Spike 1. Free tier will not be used
for MVP development or production.
**Rationale:** The account's actual Google AI Studio dashboard showed a 20 requests/day (RPD) cap
for Gemini 2.5 Flash — far below what even a single normal dev session needs, let alone Spike 1's
~15–50 planned requests. This is a harder constraint than the general "free tier has reliability
caveats" framing originally logged in this doc and in requirements.md — at this level, RPD blocks
routine development, not just edge cases.

### Monthly AI API budget ceiling: $5

**Date:** 2026-07-20
**Decision:** Cap total AI API spend (dev, spikes, and MVP usage combined) at $5/month.
**Rationale:** Token-level cost modeling for both Gemini 2.5 Flash-Lite ($0.10/$0.40 per million
tokens) and OpenAI GPT-4o-mini ($0.15/$0.60 per million tokens) puts a full 10-turn conversation at
a small fraction of a cent — thousands of conversations fit inside $5/month for either provider.
Cost is not a meaningful constraint at this project's scale.

**Update (2026-07-24):** Gemini 2.5 Flash-Lite was not actually available — Google restricts it
(and other models) from new projects/accounts without prior usage, and the 2.5 generation is
separately mid-deprecation ahead of its official Oct 16 2026 shutdown. Actual model in use is
`gemini-3.1-flash-lite` ($0.25/$1M input, $1.50/$1M output — pricier than the $0.10/$0.40 originally
assumed for 2.5 Flash-Lite). Re-checked: a 10-turn conversation is still a small fraction of a cent
at these rates, so the $5/month conclusion is unchanged — only the per-token figures in the original
entry were stale.

### Claude ruled out as MVP provider

**Date:** 2026-07-20
**Decision:** Not spiking or building against Claude (Anthropic) for this project.
**Rationale:** Claude Haiku 4.5 pricing (~$1.00/$5.00 per million tokens) is roughly 10x
Gemini/OpenAI's cheap-tier models. Not disqualifying on its own at this scale, but with no stated
preference for Claude specifically, cost tips the choice toward Gemini/OpenAI.

### Spike 1 will evaluate two providers: Gemini and OpenAI

**Date:** 2026-07-20
**Decision:** Run Spike 1 (scenario coherence) against Gemini (paid tier) first. Plan to re-run the
same spike against OpenAI (GPT-4o-mini) afterward for comparison before making a final MVP provider
decision.
**Rationale:** Token pricing and rate-limit numbers don't capture what Spike 1 is actually testing —
persona/scenario coherence quality in Norwegian across turns. That's a per-provider empirical
question, not something resolvable from pricing pages alone.
**Status:** Superseded 2026-07-21 — see "Post-spike-1 decisions" below. Gemini's result was good
enough that the OpenAI comparison spike was skipped rather than run.

### Gemini spend cap set before paid-tier usage

**Date:** 2026-07-20
**Decision:** Set a monthly Project Spend Cap in Google AI Studio (Spend tab → Monthly spend cap)
before running any paid-tier Gemini requests, set slightly below the $5 ceiling.
**Rationale:** Google's Project Spend Caps (launched March 2026) have a ~10 minute enforcement
delay; setting the cap a little under the true budget ceiling avoids a small overshoot.

### Spike 1 execution: plain Node script, not Next.js

**Date:** 2026-07-20
**Decision:** Spike 1 will be built as a standalone Node script (live, typed-in-terminal
conversation, human types the "user" side), not inside the Next.js app.
**Rationale:** Spike 1's question is about model behavior, not architecture. A Next.js Route
Handler solves a client/server API-key-exposure problem that doesn't exist in a local script run
from the terminal. Keeping the spike in plain Node isolates "does the model hold the scenario"
from "did I configure Next.js correctly" — relevant since this is also a first-time Next.js build.

---

## Post-spike-1 decisions

### AI provider for MVP: Gemini

**Date:** 2026-07-21
**Decision:** Use Gemini (paid tier) as the MVP AI provider. The planned OpenAI (GPT-4o-mini)
comparison spike is skipped, not deferred.
**Rationale:** Spike 1 held cleanly through 10 turns on Gemini with no drift or character breaks —
good enough to proceed. Running the same spike against OpenAI would cost additional real money
(OpenAI has no free/no-commitment tier to spike against — see 2026-07-20 rate-limit discussion)
for a comparison that isn't needed now that Gemini's result is satisfactory. This closes the
"Spike 1 will evaluate two providers" decision below without a second data point — a deliberate
scope cut, not an oversight.

### Max turns per session: not fixed from Spike 1, decided on the go

**Date:** 2026-07-21
**Decision:** Spike 1 does not produce a hard max-turns number. Coherence held through all 10
tested turns with no observed ceiling, so the limit will be set/tuned during build rather than
derived from a spike-observed breaking point.
**Rationale:** The original done criteria (see Spike 1 question above) expected the spike to
surface a drift/break point that would directly set the limit. Since no such point appeared within
the tested range, there's nothing to derive a number from yet — inventing one now would be
guessing, not deciding. Revisit if longer sessions are tested later or if real usage surfaces
drift beyond 10 turns.

## v0 sequencing decisions (2026-07-22)

### No auth for MVP

**Decision:** No auth/user concept for MVP, including v0.
**Rationale:** No stated need for it yet; can be added later without reworking the core loop.

### v0 builds against a single hardcoded scenario

**Decision:** First build targets one hardcoded scenario (situation + goal + constraints, generic
persona), not the full scenario library.
**Rationale:** Prioritizes getting the core conversation loop working and getting a feel for the
app quickly. Does not reverse the "scenario library from the start" concept decision — it sequences
it: prove the loop against one scenario, generalize to a library afterward, rather than building
library infrastructure before the loop itself exists.

### Evaluation sequenced after the basic loop, no feasibility spike

**Decision:** Build the basic conversation loop first, with no evaluation. Add evaluation as a
second slice afterward. No spike run to test evaluation feasibility first.
**Rationale:** Evaluation is judged low-risk technically — read a transcript, ask the LLM for
structured JSON — unlike Spike 1/2's genuine behavioral unknowns (persona coherence, STT accuracy).
The remaining uncertainty (reliable JSON conformance, pedagogical quality of feedback) is an
implementation/iteration concern, not a go/no-go question, so it doesn't meet the bar that justified
Spike 1 and 2. Condition for this to stay low-cost: session state must capture the full turn-by-turn
transcript from the start, since the conversation loop needs this anyway.

## v0 interaction/state design (2026-07-22)

### State model

v0 conversation loop is a single-flow state machine with these states:

**Note (2026-07-23):** `aiTurnReady` split into two states — see "State model correction" below.

- `idle` — start conversation button
- `initializing` — create Gemini chat with scenario systemInstruction, determine who opens
- `waitingForAI` — either the hidden opening instruction (if AI opens) or the user's just-sent
  message (if user opens) is in flight
- `aiTurnSpeaking` — AI's reply added to transcript + chat balloon, TTS playing
- `aiTurnReady` — TTS finished, Reply button enabled
- `listening` — STT active (`continuous = true`), countdown running, Send hidden until timeout
- `listeningTimedOut` — STT force-stopped at countdown zero; transcript-so-far stays editable,
  user must manually click Send (no auto-send, no auto-end)
- `sending` — user message sent to Gemini
- `ended` — terminal state, "Conversation is ended" message in chat area
- `error` — transient, not terminal; shown as a system message in chat area with Retry

Loop: `sending` → `waitingForAI` again for the next turn, until max-turns is reached, then →
`ended`.

### Turn counting

One turn = one user message + one AI reply pair. Whichever side does _not_ open the conversation
also closes it — i.e. the turn-limit check fires right after the non-opening side's Nth message
completes, not on a fixed side. **Only successful turns count** — a failed/retried request does
not consume turn budget.

### Hidden opening instruction

The synthetic "start the scene" instruction sent to the AI when it opens (see interaction step 3)
is NOT part of the transcript and must not be sent to evaluation later. Only real user/AI turns are
stored.

### Error handling

- Can occur in `initializing`, `waitingForAI`, `sending`, and STT failure in `listening`.
- Shown as a system-style message in the chat area (not a separate banner), with a Retry action.
- Retry re-attempts only the specific failed operation (same chat creation call, same Gemini
  request, same message, same STT activation) — never restarts the whole conversation.
- v0 error messaging is generic (no per-failure-type UI) — deliberate scope cut, not an oversight.

### End conversation (always live)

Available from every state, including mid-turn. On click: abort in-flight Gemini request, stop TTS
playback, stop STT recognition, clear any countdown timer, transition to `ended`.

### User-turn timeout behavior

At countdown zero: force-stop STT, keep whatever was transcribed, let the user manually hit Send.
No auto-send, no auto-discard, no auto-end. (See backlog: discard/restart-reply as a possible
future improvement, not v0.)

### State management approach: useReducer + discriminated union, not XState

**Decision:** Implement the v0 state machine with `useReducer` and a TypeScript discriminated union
(`type State = { status: 'idle' } | { status: 'aiTurnSpeaking'; ... } | ...`), switch-based reducer.
Not XState.
**Rationale:** The model above is a mostly-linear flow with a few well-defined branches
(error/retry, timeout, end-from-anywhere) — no parallel states, nested/hierarchical states, or
history states, which is where XState's cost starts paying for itself. Adding XState now would
layer a third unfamiliar concept on top of the two already-active learning goals (Next.js,
TypeScript) rather than reinforcing them. The discriminated-union + switch approach directly
exercises the TypeScript learning goal (exhaustiveness checking via a `never` default case).
**Known risk to guard against:** the reducer must explicitly no-op on actions that don't apply to
the current state (e.g. a stray `SEND_MESSAGE` dispatch while in `idle`), rather than assuming the
UI only ever dispatches valid actions — races between async callbacks (TTS finishing, STT events)
and fast user clicks (e.g. End conversation) are a realistic failure mode otherwise.
**Revisit if:** parallel/nested states are needed later, or a team context makes XState's tooling
(visualizer, guards) worth the added concept surface.

### State model correction: split `aiTurnReady` into two states

**Date:** 2026-07-23
**Decision:** The original `aiTurnReady` state ("TTS finished, Reply button enabled") is split into
two states:

- `readyForUserStart` — user opens the conversation; button reads "Start speaking". No AI turn has
  happened yet, so there's no TTS to have finished.
- `readyForUserReply` — AI has just finished speaking (TTS done); button reads "Reply".
  **Rationale:** Caught while implementing the reducer: the original 10-state model conflated "user
  goes first" and "AI just finished speaking" under one state name, even though the button label and
  the reason the button is enabled differ between them. `Ready` is used as a prefix (not suffix, as
  in the original `aiTurnReady`) specifically so busy/in-flight states (`waitingForAI`) and
  idle/ready states (`readyForUser*`) stay visually distinguishable at a glance in the state list.

### Mock LLM responses during dev: small real-API spike first, then mock behind shared interface

**Date:** 2026-07-24
**Decision:** Before building the mock, do a small isolated integration (Route Handler + single
round-trip Gemini call, not wired into the state machine) to learn real request/response shape,
multi-turn session handling, and error shapes (rate limit, timeout, malformed JSON). Use that to
define the real `ConversationApiResult` type. Then build a mock implementation against that same
type/function signature, and wire the v0 state machine to the mock — not to live Gemini — for all
UI/reducer development. Swap in the real implementation behind the same signature once the state
machine is proven out against the mock.
**Rationale:** Spike 1 already validated model behavior (coherence across turns); what's still
unknown is SDK/Route Handler mechanics, not model quality — worth a small dedicated look rather than
skipping straight to either full integration or a guessed mock shape. Wiring the reducer to live
Gemini directly would recreate the problem the mock was meant to solve: every dev-loop reload during
UI/reducer debugging burns real requests against the $5/month cap, and couples two separable
unknowns (does the reducer transition correctly? does the API call behave correctly?) back together.
A shared function signature (mock vs real) means swapping implementations later isn't a redesign.

### Spike 3: Gemini SDK mechanics inside a Next.js Route Handler

**Question:** How does the Gemini SDK behave when called from a Next.js Route Handler using
`interactions.create` — turn creation with `system_instruction`, multi-turn continuity via
`previous_interaction_id` across separate stateless requests, and the actual shape of a
successful response object (`output_text`, `steps`)?

**Why it matters:** Spike 1 validated model behavior (persona/scenario coherence) via a plain Node
script using `chats.create`, which relies on an in-memory JS object holding conversation history —
a pattern that doesn't map cleanly onto a stateless Route Handler, where there's no long-lived
process to hold that object between turns. `interactions.create` is Google's recommended API for
new development and stores conversation state server-side via `previous_interaction_id`, meaning
the Route Handler only needs to persist one ID per session rather than reconstruct/resend full
history on every request. This spike tests whether that mechanic actually behaves as documented
when called from a Route Handler, and confirms the real `ConversationApiResult` shape the later
mock (see 2026-07-24 mock decision) depends on.

**Scope:** Happy path only — button triggers a Route Handler call to `interactions.create` (model
`gemini-3.1-flash-lite` — confirm still available under this endpoint before running; the docs
example shows `gemini-3.6-flash`, which is not our model), placeholder `system_instruction`;
textarea + send triggers a second Route Handler call using `previous_interaction_id` from the
first response; confirm session context carries over. No error handling, retry, styling, or
TypeScript rigor — throwaway learning code.

**Date run:** 2026-07-25

**Outcome:**

- `gemini-3.1-flash-lite` is available under the `interactions.create` endpoint — confirms the
  model choice from the 2026-07-24 pricing correction, resolves the scope note above.
- `system_instruction` is **not** carried over server-side via `previous_interaction_id` — it must
  be sent on every `interactions.create` call, including follow-up turns, or the persona/scenario
  framing is lost after the first turn. This is the opposite of what the spike's premise assumed
  (that `previous_interaction_id` would let the Route Handler avoid resending setup).
- Conversation history/context itself **does** carry over correctly via
  `previous_interaction_id` — a follow-up call referencing the first response's id continues the
  same interaction without needing prior turns resent.

**Consequence:** The Route Handler (and later `ConversationApiResult`/mock work) must treat
`systemInstruction` as a required field on every request, not a first-turn-only field. The
scenario's system instruction needs to be available client-side (or re-derivable server-side) for
the full session lifetime, not just at session start.

**Status:** Done. Supersedes the original `chats.create`-based scoping — decided 2026-07-24, before
running the spike, specifically because the statelessness mismatch was caught during planning
rather than discovered mid-spike.

### Spike 4: Gemini error shapes

**Question:** What do Gemini SDK failures actually look like — malformed/unexpected response,
rate limit, and timeout?
**Why it matters:** Defines the error/failure branch of `ConversationApiResult`, needed before the
mock and the real error-state UI (per the v0 `error` state in the interaction design) can be built
against a real shape rather than a guess.
**Scope:**

- Malformed/unexpected response: triggered live against the real API.
- Rate limit: not triggered live (impractical/wasteful against the $5 cap) — documented shape
  pulled from Gemini API docs instead.
- Timeout: not triggered live — either documented shape from Gemini API docs, or a self-simulated
  timeout via client-side AbortController. If simulated, note explicitly that this only shows what
  Claude's own abort code produces, not Gemini's real behavior under a genuinely slow response.
- For the live-triggered case, confirm whether it's a catchable exception or a silently
  "successful" but empty/invalid response.

**Date run:** 2026-07-25

**Outcome:**

- Live-triggered SDK failures throw a plain object shaped `{ name, status, error: { code, message
} }` — there is no importable/exported error class to `instanceof`-check against, so
  discrimination must be structural (check `.name` / `.status`), not class-based.
- The SDK's own timeout option is unreliable for testing: it interacts with the SDK's built-in
  retry behavior, so a configured timeout doesn't deterministically fail the call once. Passing an
  `AbortSignal` via `fetchOptions: { signal }` is the reliable way to force a timeout-like failure
  on demand.
- Client-side aborts (via that `AbortSignal`) throw `APIUserAbortError` — confirmed both as
  `error.name` and `error.constructor.name`. This is reliably distinguishable from a 404
  "not found" failure (e.g. bad model name) by `name` alone, which is exactly the discrimination
  `ConversationApiResult`'s error branch needs.
- Rate limit shape was not live-triggered (per the scope decision above — impractical against the
  $5 cap) and still relies on documented shape from Gemini API docs, not empirical confirmation.

**Consequence:** `ConversationApiResult`'s error branch must be designed around structural checks
(`name`/`status`/`error.code`) rather than `instanceof` against SDK error classes — there aren't
any to check against. Route Handler timeout handling should use `fetchOptions: { signal }` with a
manual `AbortController`/timer, not the SDK's own timeout config.

**Status:** Done.

### Result type built as `AIChatResult`, not `ConversationApiResult`

**Date:** 2026-07-25
**Decision:** The result type planned in the 2026-07-24 mock decision and named
`ConversationApiResult` throughout Spike 3/4 planning was implemented as `AIChatResult`
(`src/lib/aiService.ts`), matching the earlier "conversation → chat" renaming
(`f8dd754 rename conversation to chat`).
**Rationale:** Naming consistency with the rest of the codebase (`sendChatMessage`, `/api/ai/chat`,
`/api/aiMock/chat`) — no functional difference from the shape planned in Spike 3/4. Earlier
decisions in this log referring to `ConversationApiResult` describe the same type under its old
planned name.
**Status:** Done. Mock implementation (`/api/aiMock/chat`) built against this type, toggled via
`NEXT_PUBLIC_USE_MOCK_AI`.

### Conversation always ends with AI speaking last

**Date:** 2026-07-26
**Decision:** Regardless of which side opens, the conversation always ends with an AI turn. This
overrules the 2026-07-22 "Turn counting" decision, which stated "whichever side does not open the
conversation also closes it" — under that rule, an AI-opens-first session would have ended on an
unanswered user turn.
**Rationale:** Ending on the user's line with no AI reply would feel abrupt/unfinished for a
conversation-practice product — the AI should always have the last word. This only changes behavior
for the AI-opens-first case; user-opens-first sessions already ended with the AI per the prior rule.
**Consequence:** The max-turns check changes from "fires after the non-opening side's Nth message
completes" to a check that fires before sending what would be the closing AI request — meaning a
turn counter needs to exist in state, which it doesn't yet. Not designing that mechanism now (see
backlog: separate closing-instruction for the AI's final turn, deferred).
**Status:** Turn-counter mechanism and any "wrap up the conversation" instruction are open — tracked
in backlog.md, not designed here. **Update 2026-08-04:** the turn-counter mechanism this depended on
is discarded (see "Turn counter / max-turns: discarded" below) — "AI always speaks last" is no
longer actively enforceable and currently isn't enforced: a session can end via "End session" after
any turn, including mid-AI-turn, the same way `STOP_CHAT` always could before it (see decisions.md,
"Reply-phase UX redesign implemented"). This rule now describes the intended shape of a _normal_
session ending (nothing currently forces it), not a guarantee.

### No dedicated `sending` state

**Date:** 2026-07-27
**Decision:** Drop the `sending` state from the 2026-07-22 model. `listening` transitions
directly to `waitingForAI` on `USER_MESSAGE_SENT` — there is no separate in-flight-transmission
state.
**Rationale:** The original list already covered "the user's just-sent message is in flight"
under `waitingForAI`; `sending` never added distinct meaning beyond that. Deliberate
simplification, not an oversight.

### No `initializing` state

**Date:** 2026-07-27
**Decision:** Drop the `initializing` state from the 2026-07-22 model.
**Rationale:** `initializing` was scoped around creating a persistent Gemini chat object
(`chats.create`) and determining who opens before the first request. Since Spike 3 moved
implementation to `interactions.create`, systemInstruction is resent on every turn regardless —
there's no chat object to create up front. For v0's single hardcoded scenario, "who opens" is a
static per-scenario value, not something needing an async determination step. Revisit once real
scenario loading exists.

### Turn counter / max-turns postponed

**Date:** 2026-07-27
**Decision:** Postpone the turn counter / max-turns limit. For now, "End conversation" (explicit
user action) is the only way a session ends.
**Rationale:** Avoids building termination logic that isn't blocking anything yet. When it is
built, the 2026-07-26 rule stands: AI always speaks last.
**Status:** Superseded 2026-08-04 — see "Turn counter / max-turns: discarded" below. No longer
just postponed; not planned.

### Turn counter / max-turns: discarded, not merely postponed

**Date:** 2026-08-04
**Decision:** No turn counter / max-turns mechanism will be built. Explicit "End session" remains
the only way a session ends, indefinitely — this is not a temporary state pending a future build.
**Rationale:** Direct call, not derived from new evidence — the postponed mechanism was never
blocking anything, and there's no plan to pick it up. Discarding it outright (rather than leaving
it open in backlog.md) avoids carrying a stale "still to do" item.
**Consequence:** The 2026-07-26 "conversation always ends with AI speaking last" rule loses its
only planned enforcement mechanism — see the update appended to that entry above. Tracked as
discarded (not "postponed") in backlog.md.
**Status:** Done — reflected in backlog.md, requirements.md, and status.md.

### `listeningTimedOut` deferred to STT work

**Date:** 2026-07-27
**Decision:** Implement `listeningTimedOut` alongside real STT integration, not before.
**Rationale:** Timeout logic is meaningless against the current mock textarea — there's no real
listening session to time out. Bundling avoids building against a guessed shape.

### Visual/UI design phase sequenced after core loop, before evaluation

**Date:** 2026-07-27
**Decision:** Do the visual/UI design pass (tokens, layout, accessibility) after the core
conversation loop is functionally complete (stop-from-any-state fix, error handling, real STT/TTS,
real Gemini swap) and before evaluation is built.
**Rationale:** Interaction design is still actively changing (two states dropped, stop/error scope
still being defined) — styling components whose shape is still shifting risks rework, and CSS
tokens are meant to be a closed scale, which shouldn't be locked in while the UI is still churning.
Once the core loop is functionally done, `ThreadView`/`ControlsArea`/new error-and-STT UI will be
structurally settled enough to style with low rework risk. Sequencing before evaluation (rather
than after, or before the functional work) also produces one fully-styled, working, demoable
conversation loop as an earlier case-study checkpoint, instead of leaving the whole app unstyled
until everything — including evaluation — exists.
**Status:** Open — full design.md decisions (token values, layout, accessibility approach) not yet
made; only the _timing_ is decided here.

### `idle` renamed to `readyForNewChat`

**Date:** 2026-07-27
**Decision:** Rename the `idle` phase to `readyForNewChat`.
**Rationale:** `idle` didn't convey what the state actually means — that a new chat can be started
from it. `readyForNewChat` states that explicitly, consistent with the existing `readyForUserStart`
/ `readyForUserReply` naming.
**Status:** Superseded 2026-07-30 — renamed again to `chatStartPending`, reflecting the mount-effect
trigger change. See "Setup screen extraction & component restructuring" below.

### `STOP_CHAT` handled from every reducer phase

**Date:** 2026-07-27
**Decision:** Check `STOP_CHAT` once at the top of `chatReducer`, before the phase-specific switch:
if the action is `STOP_CHAT` and the current phase is neither `readyForNewChat` nor `ended`,
transition straight to `ended` regardless of which phase the state machine is in.
**Rationale:** The previous implementation only handled `STOP_CHAT` inside the `listening` case;
every other phase fell through to `default: return state`, so ending the conversation mid-turn
(e.g. during `waitingForAI` or `aiTurnSpeaking`) silently no-opped even though the "End
conversation" button is always rendered and always dispatches `STOP_CHAT` (see `ControlsArea.tsx`
in status.md). This was the exact failure mode the original useReducer decision entry flagged as a
risk to guard against. A single top-level check (rather than repeating a `STOP_CHAT` case in every
phase's inner switch) keeps the guard in one place instead of duplicated across every branch.
**Status:** Superseded 2026-08-04 — the `STOP_CHAT` action (and the `ended`/`chatEnded` phase it
transitioned to) is removed entirely as part of the reply-phase redesign; ending a session is now
always a direct `onEndSession` component call, not a reducer action, from every phase except the
`listening`-adjacent input-flow window. See "Reply-phase UX redesign implemented" below.

### Error message extraction: `error.message` unreliable, parse `error.body` instead

**Date:** 2026-07-27
**Decision:** Route Handler error handling no longer reads `error.message` directly for the
user-facing message. It parses `error.body` (the raw response body string) via a new
`extractApiErrorMessage` helper, falling back to `error.message` only if that parsing fails.
**Rationale:** Discovered while testing invalid-API-key and invalid-model-name failures live: the
underlying Gemini API returns inconsistent error body shapes depending on error type — bad model
name returns a bare `{"error": {...}}` object, but bad API key returns the same shape wrapped in an
array (`[{"error": {...}}]`). The `@google/genai` SDK's error parser assumes the bare-object shape;
against the array-wrapped case it fails to populate `.error.message`, so `BadRequestError` falls
back to a generic `"API error occurred: " + JSON.stringify(httpMeta)` message, which is
uninformative (`httpMeta` serializes to near-`{}` since `Response`/`Request` objects have no
meaningful `toJSON()`). The real message is always present in `error.body` as a string, just not
always reachable via `error.message`.
**Consequence:** This does not affect Spike 4's `name`/`status`-based structural error
discrimination, which remains reliable — only the human-readable message text was affected.
`AIChatResult`'s error branch keeps using `name`/`status` to decide error type; only the message
string extraction changed.
**Status:** Done — implemented in `src/app/api/ai/chat/route.ts`.

### Error recovery: end-session only, no retry, for v0

**Date:** 2026-07-27
**Decision:** No Retry action for v0. The only recovery path from the `error` phase is
"End conversation" (already covered by the existing top-level `STOP_CHAT` handling).
**Rationale:** A generic retry-the-failed-operation isn't judged useful — most failure
causes (bad config, malformed request) will fail identically on retry. Per-error-type
recovery logic is deferred rather than built against a guess of which errors are
actually transient.
**Status:** Superseded same-day — see "Error recovery implemented" below. The
STOP_CHAT-already-covers-it assumption turned out not to match what was actually built.

### Error recovery implemented: dedicated `END_SESSION` action, not `STOP_CHAT`

**Date:** 2026-07-27
**Decision:** Generic error-state recovery is built. In the `error` phase:

- The ghost "End conversation" button (`STOP_CHAT`) is hidden — `ControlsArea`'s
  `shouldShowStopButton` explicitly excludes `status === 'error'`.
- The primary button instead reads "End this session" and dispatches a new `END_SESSION`
  action.
- The reducer's `error` case handles `END_SESSION` by resetting straight to
  `{ threadItems: [], phase: { status: 'readyForNewChat' } }` — a full reset back to the
  start, not a transition through `ended`.
- `ErrorArea.tsx` renders the raw `phase.error.error` message in the chat area; unstyled,
  no per-error-type differentiation (unchanged from the decision above).

From the `error` phase, ending the session is the only available action — no Retry, and
the normal "End conversation" path is not offered alongside it.

**Rationale:** Corrects the same-day decision above, which assumed the existing top-level
`STOP_CHAT` handling already covered end-from-error with no reducer changes needed. In
practice a dedicated path was built instead: ending from an error should discard the
broken session and return the user to a fresh start (`readyForNewChat`), not land in the
terminal `ended` phase, which implies a normal, completed conversation now waiting on
evaluation — a different meaning than "this session errored out." Hiding the generic
ghost "End conversation" button while in `error` avoids offering two differently-behaving
end actions at once.
**Status:** Superseded 2026-07-30 — the `END_SESSION` action is removed from the reducer
entirely once `ChatSetup`/`ChatContainer` exist. Ending a session (from both `error` and
the renamed `chatEnded` phase) is now a direct call from `ChatConversation` to an
`onSessionEnd` prop owned by `ChatContainer`, not a dispatched action. The underlying
_policy_ this entry established — end-session-only recovery, no Retry, no per-error-type
differentiation — is unchanged; only the mechanism changed. See "Setup screen extraction
& component restructuring" below.

### Scenario/chat config extracted into src/lib

**Date:** 2026-07-28
**Decision:** Pulled the hardcoded `systemInstruction`/`aiHasFirstTurn` consts out of
`ChatClient.tsx` into four `src/lib` files:

- `scenarios.ts` — `Scenario` type + a `scenarios` array (currently one placeholder entry)
- `language.ts` — `Language` type (`{ name, locale }`), factored out on its own after starting
  in `chatConfig.ts`, to avoid a circular import between `chatConfig.ts` and
  `getBaseInstruction.ts`
- `getBaseInstruction.ts` — `getBaseInstruction(language)`, the generic "always reply in X,
  plain text only" instruction shared across all scenarios
- `chatConfig.ts` — `ChatConfig` type + `getChatConfig(language, scenario)`, combining the base
  instruction with a scenario's own instruction text

`page.tsx` now selects a scenario (`scenarios[0]` for now) and language, builds `chatConfig` via
`getChatConfig`, and passes it into `ChatClient` as a prop. `ChatClient` destructures
`systemInstruction`/`aiHasFirstTurn` from that prop instead of defining them as local consts.

**Rationale:** Anticipates the scenario library concept without building it yet — scenario
selection now has a place to live (`page.tsx`, Server Component) separate from `ChatClient`'s
conversation logic, and adding scenarios later means adding array entries, not touching
`ChatClient`. Splitting `Language` into its own file rather than leaving it in `chatConfig.ts`
follows the same reasoning as the mid-refactor circular-import fix: `Language` isn't a chat-config
concept, it's a more primitive one both `chatConfig.ts` and `getBaseInstruction.ts` need.
**Status:** Done. `scenarios.ts` still holds placeholder content only — real scenario data/schema
(situation + goal + constraints) remains undesigned, per the existing "core data structures
deliberately deferred" decision (2026-07-22). **Update (2026-08-09):** `aiHasFirstTurn` is renamed
to `starter` — see "`Starter` type moved to `scenarios.ts`" near the end of this log.

### STT integration design: stop/transcript split, display-only transcript before send

**Date:** 2026-07-28
**Decision:** Real STT integration will use two new phases and two new actions, plus a dedicated
`SpeechToText` component:

- **New phases:**
  - `listeningStopped` — transitional; entered when the user clicks "Stop listening". Signals
    `SpeechToText`'s effect to call `recognition.stop()` and wait for `onresult`/`onend`.
  - `readyForSendingUserReply; transcript` — entered once `SpeechToText` reports a transcript.
    The transcript is carried on the phase object itself (not appended to `threadItems` yet).
- **New actions:**
  - `STOP_LISTENING` — dispatched by `ChatClient` when the user clicks "Stop listening";
    `listening` → `listeningStopped`.
  - `TRANSCRIPT_CREATED; payload: { transcript }` — dispatched via `SpeechToText`'s
    `onTranscriptCreated` callback once recognition produces a result; `listeningStopped` →
    `readyForSendingUserReply; transcript`.
- **`SpeechToText` component:** child of `ChatClient`, props `phase`, `onTranscriptCreated`,
  `onError`. Recognition lifecycle keyed off `phase` via `useEffect`: starts on `listening`,
  calls `recognition.stop()` on `listeningStopped`.
- **Existing `USER_MESSAGE_SENT` action is unchanged and reused.** `ChatClient` reads
  `state.phase.transcript` when in `readyForSendingUserReply` and passes it as `message` in the
  dispatch payload when "Send message" is clicked — same pattern as the current mock-textarea flow.
  The transcript only lands in `threadItems` at that point, not when it's first created.

**Addendum to "STT transcript review step: not needed for MVP" (2026-07-19):** the transcript is
now displayed (read-only) between stop and send. This does **not** reverse the 2026-07-19
decision — there is still no edit/correction capability, and STT output is still sent to the LLM
unedited. Display is added as scaffolding for the deferred `listeningTimedOut` work (see backlog),
where showing transcript-so-far becomes necessary anyway; building it now avoids guessing its
shape later.

**Rationale:** Splitting "stop" from "send" into two phases (rather than one direct
`listening` → send transition) gives `listeningTimedOut` a natural landing spot later — timeout
can transition into the same `listeningStopped`/`readyForSendingUserReply` path a manual stop
already uses, rather than needing its own separate flow designed from scratch.

**Scope note:** `listeningTimedOut` itself remains explicitly deferred, per the 2026-07-27
decision — this entry only adds the stop/transcript-display mechanics, not the countdown/timeout
logic.

**Status:** Design decided. Implemented in the commits below — see "STT integration implemented"
and "Empty-transcript handling" further down.

### STT integration implemented; `MockTTS` replaced by `MockSTT` dev/testing fallback

**Date:** 2026-07-29
**Decision:** Real Web Speech API recognition is wired into `SpeechToText.tsx` per the 2026-07-28
design (`listeningStopped`/`readyForSendingUserReply; transcript` phases, `STOP_LISTENING`/
`TRANSCRIPT_CREATED` actions). `MockTTS.tsx`/`MockTTS.module.css` (the old typed-textarea
stand-in for STT input) are deleted and replaced by `MockSTT.tsx`/`MockSTT.module.css`. Unlike
`MockTTS`, which was the entire input mechanism, `MockSTT` is a fallback only: `SpeechToText`'s
`handleEnd` first builds the transcript from real recognition results
(`createFullTranscript()`), and only reads `MockSTT`'s textarea value (via an imperative handle,
`MockSTTHandle.getMockValue()`) when that real transcript is empty.
**Rationale:** Meant for dev/testing convenience — lets development continue by typing input
instead of speaking every time the loop is tested, without needing a working mic/speech input on
every pass. Not a defensive fallback for a known Web Speech API reliability problem.
**Status:** Done.

### Empty-transcript handling: new `TRANSCRIPT_EMPTY` action, silent retry back to `readyForUserReply`

**Date:** 2026-07-29
**Decision:** New `ChatAction`: `TRANSCRIPT_EMPTY` (no payload). In `SpeechToText.tsx`,
`handleEnd` calls `onTranscriptCreated` with an empty string when both the real recognition
transcript and the `MockSTT` fallback are empty. `ChatClient.tsx`'s `handleTranscriptCreated`
checks for an empty string and dispatches `TRANSCRIPT_EMPTY` (in addition to the existing
`TRANSCRIPT_CREATED` dispatch). In the reducer, `listeningStopped` handles `TRANSCRIPT_EMPTY` by
transitioning straight back to `readyForUserReply` — not into
`readyForSendingUserReply; transcript: ''`.
**Rationale:** Intended UX is a silent retry: no error shown, nothing sent, the user just lands
back where they can click "Reply" and start listening again, as if nothing happened. Landing in
`readyForSendingUserReply` with an empty transcript would otherwise let the user hit "Send" and
post an empty message.
**Status:** Done — implemented in `chatReducer.ts`, `SpeechToText.tsx`, `ChatClient.tsx`.

### STT display switched to live interim transcript

**Date:** 2026-07-29
**Decision:** `SpeechToText.tsx` sets `recognition.interimResults = true` (previously `false`).
`handleResult` no longer accumulates only `isFinal` results into a `speechResultsRef` array
joined with spaces (`addSpeechResult`/`createFullTranscript`, now removed); instead, on every
`onresult` event it joins _all_ current results (interim + final) into one string and stores it
in a `liveTranscriptRef`/`liveTranscript` state pair. `handleEnd` reads `liveTranscriptRef.current`
directly (falling back to `MockSTT` when empty, unchanged from the 2026-07-29 STT-integration
decision above). `SpeechResults.tsx` renders `liveTranscript` as it updates, with a "Listening…"
placeholder shown only while `phase.status === 'listening'` and the transcript is still empty, and
a "…" typing indicator once text has appeared.
**Rationale:** Works around a Safari-on-iOS bug found while dev-testing the STT flow: if `onresult`
had already fired at least once, it would not fire again after `recognition.stop()` was called,
silently dropping the last (final) result. Setting `interimResults = true` and continuously
rebuilding `liveTranscript` from every `onresult` event means the last spoken segment is already
captured in state by the time `onend` fires, regardless of whether a final `onresult` for it ever
arrives. Showing the transcript live as a side effect is a secondary benefit, not the driving
reason (commits `ee35bfe`, `5471717`, same day as the initial STT integration).
**Status:** Done. Does not reverse the 2026-07-19 "no transcript review/edit step" decision — the
transcript is still display-only and sent unedited; this only changes _when_ text appears
(live vs. only after `onend`), not whether the user can edit it.

### Dev config: allow ngrok origin for the Next.js dev server

**Date:** 2026-07-29
**Decision:** `next.config.ts` sets `allowedDevOrigins: ['*.ngrok-free.app']`.
**Rationale:** Next.js's dev server blocks cross-origin requests by default; this allowlists
requests tunneled through ngrok, needed to reach the local dev server from a device other than the
machine running it (commit `f662a2f`, same day as the STT work this enables testing).
**Status:** Done.

---

## Setup screen extraction & component restructuring (2026-07-30)

### New `ChatContainer`/`ChatSetup` components; `ChatClient` renamed to `ChatConversation`

**Date:** 2026-07-30
**Decision:** `chat/page.tsx` stays a thin Server Component, now rendering a new client component
`ChatContainer`. `ChatContainer` owns state deciding whether to render `ChatSetup` (a new form:
language radios + scenario radios + "Start conversation" button) or `ChatConversation` — the
component previously named `ChatClient`.
**Rationale:** Need a place to pick language and who starts before entering the conversation loop —
partly a real product need (this will need to exist eventually regardless), partly immediate dev
convenience (switching languages/starters frequently during testing). Scope for v0: only the
"freeform chat" case (user picks language + who starts) is built now. A second case — a predefined scenario
that dictates its own starter — is out of scope for now; this doesn't reverse the "scenario library
from the start" concept decision, it sequences it the same way the single-hardcoded-scenario v0
decision (2026-07-22) already does.

### Component rename: `ChatClient` → `ChatConversation`

**Date:** 2026-07-30
**Decision:** Rename `ChatClient` to `ChatConversation`.
**Rationale:** `ChatClient` was originally named for the `'use client'` directive. With
`ChatContainer` now also a `'use client'` component, "client" in `ChatClient` would ambiguously read
as either "client-side" (the original meaning) or "client role" (as opposed to setup) — the same
kind of silent naming drift already avoided elsewhere in this project (e.g. `idle` →
`readyForNewChat`). Renamed rather than reassigning the existing name to a new meaning.

### Freeform chat modeled as two explicit `Scenario` objects, not entries in the `scenarios` array

**Date:** 2026-07-30
**Decision:** Two `Scenario`-typed objects are defined for the freeform-chat case — one with
`aiHasFirstTurn: false` (user starts), one with `aiHasFirstTurn: true` (AI starts) — reusing the
existing instruction text unchanged. These are defined separately, outside the `scenarios` array,
and imported directly by `ChatSetup`.
**Rationale:** The `scenarios` array is meant to grow into a real scenario library, which won't map
well onto a small fixed radio-button UI. Keeping the freeform-chat pair separate avoids conflating
"modes" with "scenarios" in the same array, and avoids any signature change to `getChatConfig` or to
`aiHasFirstTurn`'s placement on `Scenario` — "who starts" is expressed by which scenario object the
user picks, reusing existing types and logic as-is.
**Known gap, not solved now:** once real scenarios exist, nothing distinguishes "this is a
freeform-chat mode entry" from "this is a real scenario" at the type level — flagged as a probable
future need (e.g. a `category` field), not designed against yet.
**Update (2026-08-09):** `aiHasFirstTurn` is renamed to `starter` — see "`Starter` type moved to
`scenarios.ts`" near the end of this log.

### New `languages.ts` config file, separate from the `language.ts` type

**Date:** 2026-07-30
**Decision:** The list of supported languages (starting with `nl-NL` and `nb-NO`) lives in a new
`languages.ts` file, separate from `language.ts` (which continues to define the `Language` type
only).
**Rationale:** The list is config-like data, not a type definition — same reasoning already applied
when `Language` was split out of `chatConfig.ts` on its own (2026-07-28).

### `ChatSetup` loads with pre-selected defaults

**Date:** 2026-07-30
**Decision:** The language and scenario radio groups on `ChatSetup` load with a default option
already selected, rather than requiring an explicit pick before "Start conversation" is enabled.
**Rationale:** Matches actual dev usage — languages/starters get switched frequently during
development, so Start should always be immediately clickable.

### `chatReducer` scope narrowed to conversation-only states; `END_SESSION` action removed

**Date:** 2026-07-30
**Decision:** Ending a session and returning to `ChatSetup` is no longer modeled as a reducer
action or phase. The `END_SESSION` action (added 2026-07-27 — see that entry above, now marked
superseded) is removed from `ChatAction` and from the reducer's `chatEnded`/`error` cases entirely.
Instead, `ChatConversation` calls an `onSessionEnd` prop (passed down from `ChatContainer`) directly
from its end-session handler — no dispatch, no phase transition involved.
**Rationale:** `chatReducer` should only describe the state of an in-progress conversation;
"return to setup" is a decision about which component is mounted, owned by `ChatContainer`, not a
conversation state. A `sessionEnded` phase (modeling this as a phase + a `ChatConversation` effect
watching for it) was considered and rejected — it would route a transition through the reducer
whose resulting state is never actually read, since the component unmounts right after.
**Consequence:** `chatEnded` (see rename below) remains a real terminal phase, reached via
`STOP_CHAT` mid-conversation or, once built, a turn limit — only the _action taken from that phase_
changed, not the phase's existence. The end-session-only recovery policy from the 2026-07-27
decision (no Retry, no per-error-type differentiation) is unchanged; only the mechanism is.
**Known dead code, not yet removed:** `canStartChat` (in `chatReducer.ts`) has no remaining caller
once the Start action moves out of `ChatConversation` — flagged for removal, not yet done.

### `ended` renamed to `chatEnded`; no `sessionEnded` phase added

**Date:** 2026-07-30
**Decision:** The `ended` phase is renamed to `chatEnded`.
**Rationale:** Reads more clearly now that "ending the session" (returning to `ChatSetup`) is no
longer a reducer concern (see above) — `chatEnded` means only "this conversation is over," not "and
now return to setup," which is a separate, component-level concern handled by `ChatContainer`.
**Status:** Decided 2026-07-30 but not applied when the rest of the setup screen was implemented —
`chatReducer.ts` still read `'ended'` throughout. Caught and applied while updating docs after the
setup screen implementation landed (2026-07-30 session); confirmed via `tsc --noEmit` that no other
file referenced the literal. Superseded 2026-08-04 — `chatEnded` is removed as a phase entirely
(not renamed again), as part of the reply-phase redesign; see "Reply-phase UX redesign
implemented" below.

---

## Setup screen implemented (2026-07-30, same day as the design decisions above)

**Decision:** The setup screen design decided earlier the same day (see all entries above under
"Setup screen extraction & component restructuring") is now built, across three commits
(`c1474b4` rename, `71c4a78` setup form + starter choice, `6a1be86` language picker):

- `ChatContainer.tsx` — owns a `ContainerState` union (`{ status: 'setup' }` /
  `{ status: 'conversation'; chatConfig }`) plus the currently-selected `Language`. Renders
  `ChatSetup` or `ChatConversation` based on that union. `handleSessionEnd` (passed to
  `ChatConversation` as the `onEndSession` prop — implemented under this name, not the
  `onSessionEnd` name used while planning) resets state back to `{ status: 'setup' }`.
- `ChatSetup.tsx` — form with a language fieldset (delegated to a new `LanguagePicker`
  subcomponent, not called out in the original plan — extracted because the language radio group
  has its own repeated markup-per-option, consistent with the project's "extract when JSX has its
  own behavior" guideline) and an inline starter fieldset (`ai/user` radio pair, kept inline since
  it's simple one-off JSX). Defaults: first entry of `supportedLanguages` and `starter: 'ai'`
  pre-selected, per the 2026-07-30 "loads with pre-selected defaults" decision. On submit, resolves
  the starter choice to `freeformChatWithAIStart`/`freeformChatWithUserStart`, builds `ChatConfig`
  via `getChatConfig`, and calls `onStartSession(chatConfig)`.
- `languages.ts` — `supportedLanguages: Language[]`, currently Dutch (`nl-NL`) and Norwegian Bokmål
  (`nb-NO`), matching the planned list.
- `chatReducer.ts` — `chatStartPending` and the `END_SESSION`-removal/`onSessionEnd`-prop-call
  design are in place as planned. `canStartChat` (flagged as dead code to remove once Start moved
  out of `ChatConversation`) is already gone. The `chatEnded` rename was the one planned item not
  yet applied — see the entry directly above.

**Note on `Language.locale` → `Language.languageTag`:** status.md previously described `Language` as
`{ name, locale }`. The actual field has been `languageTag` (a BCP 47 tag, e.g. `nb-NO`) since commit
`2738e0d`, predating this setup-screen work — a stale doc reference caught in passing while
verifying the setup screen against the code, not a change made now.

**Status:** Done. Setup screen is live: `chat/page.tsx` → `ChatContainer` → `ChatSetup` ⇄
`ChatConversation`.

### Start-of-chat trigger moves to a mount effect; `readyForNewChat` renamed to `chatStartPending`

**Date:** 2026-07-30
**Decision:** Since "Start conversation" is now clicked in `ChatSetup`, before `ChatConversation`
even mounts, the AI/user opening turn fires automatically via a `useEffect` on mount in
`ChatConversation`, rather than waiting for a button click inside that component. The
`readyForNewChat` phase (itself renamed from `idle` on 2026-07-27, now marked superseded) is
renamed again to `chatStartPending`, and remains the reducer's initial phase.
**Rationale:** `readyForNewChat`'s name assumed a user click was still pending inside this
component; once that click already happened in `ChatSetup`, the phase is better described as a
brief internal bootstrap step than a "waiting for the user" state. `chatStartPending` was chosen
over an alternative considered, `waitingForChatKickoff`, because "waiting for X" already carries a
specific meaning elsewhere in this reducer (`waitingForAI` = a request in flight) — reusing it here
for "mount effect hasn't fired yet" would collide with that existing convention.
**Consequence:** The mount effect needs a ref guard against React 19 StrictMode's dev-mode
double-invocation of effects, to avoid firing the start logic — and, once off the mock API, a real
duplicate request — twice.

### iOS Safari TTS silent failure: speechSynthesis requires a user-gesture unlock

**Date:** 2026-07-31
**Decision:** `unlockSpeechSynthesis()` — speaking a single empty `SpeechSynthesisUtterance` — is
called in `ChatContainer`, synchronously inside a real tap handler (e.g. "Start conversation").
**Rationale:** iOS Safari only allows `speechSynthesis.speak()` to actually produce audio when
called synchronously inside a user-gesture handler. `ThreadView`'s TTS call fires from a
`useEffect` reacting to `phase === 'aiTurnSpeaking'`, which is triggered by an async Gemini
response — not a user gesture. On iOS Safari this fails silently: `speak()` runs, `onresult`-style
logs fire, `synth.speaking` even reports `true`, but no audio plays. Chrome doesn't enforce this,
which is why the bug wasn't caught until iPad/ngrok testing. Calling `speak('')` once, synchronously
inside a genuine tap, "unlocks" the audio session for the rest of the page's lifetime — subsequent
`speak()` calls from async contexts then work normally.
**Known limitation:** the unlock doesn't persist across reloads/new tabs — must fire again on every
fresh page load.
**Status:** Done.

---

## TTS output implemented (2026-07-31 – 2026-08-01)

### `speakMessage` extracted to `src/lib/textToSpeech.ts`, driven by `ThreadView`'s `aiTurnSpeaking` effect

**Date:** 2026-07-31
**Decision:** Real TTS playback replaces the `setTimeout`/console.log stub. `textToSpeech.ts`
exports `initSpeech(onSuccess, onFail)` (wraps `speechSynthesis.getVoices()`/the `voiceschanged`
event, since Chrome vs. Firefox differ on whether voices are available synchronously) and
`speakMessage(message, voice, onSpeechEnd)`. `speakMessage` sanitizes whitespace (raw `\n`/tabs are
read as pause cues by Chrome), splits the message into sentences (Chrome caps utterance length at
~200-300 words), queues one `SpeechSynthesisUtterance` per sentence, and calls `onSpeechEnd` only on
the last utterance's `end` event. `ThreadView.tsx` (not `ChatConversation.tsx`) owns the trigger: a
`useEffect` keyed on `phase.status === 'aiTurnSpeaking'` calls `speakMessage` with the last thread
item, and its `onSpeechEnd` callback is `ChatConversation`'s `handleAISpeechEnd`, which dispatches
the pre-existing `AI_FINISHED_SPEAKING` action.
**Rationale:** `aiTurnSpeaking` already existed as a reducer phase (see 2026-07-23 state-model
correction) with only a fake 500ms `setTimeout` behind it — TTS wiring only needed to satisfy the
same `onSpeechEnd`/dispatch contract, no reducer changes required. Keeping playback in `ThreadView`
(which already renders the message being spoken) rather than `ChatConversation` avoids passing the
message text back down after already receiving it as a prop.
**Status:** Done.

### Voice availability detection per supported language

**Date:** 2026-07-31
**Decision:** `ChatContainer.tsx` calls `initSpeech` once on mount, builds a
`supportedLanguageVoices` map (one `SpeechSynthesisVoice` per BCP-47 tag in `supportedLanguages`,
first match wins) from the full `speechSynthesis.getVoices()` list, and derives `languageVoice` for
the currently-selected `Language` via a second effect. `languageVoice` is passed down into
`ChatConversation` → `ThreadView`, which no-ops on `speakMessage` if it's `undefined` (e.g. voice
not installed, or `speechSynthesis` unsupported).
**Rationale:** Resolves the mechanism half of the backlog item "check for available voices for
supported languages" — detection now exists. The other half (UI feedback / icon when a language has
no voice, degrading to text-only) is still unbuilt; `speechIsSupported` is tracked in `ChatContainer`
state but not yet consumed by any component. Left open in backlog.md.
**Status:** Detection done; UI fallback not built.

### Speech-rate correction: per-voice-engine lookup table, not per-platform heuristic

**Date:** 2026-08-01 (supersedes the 2026-07-31 `isIOS()`-based basic correction)
**Decision:** `speakMessage` no longer branches on platform. It reads a single conceptual
"Google-equivalent" rate (currently hardcoded `GOOGLE_SPEECH_RATE = 1`) and converts it to the
actual `utterance.rate` via `googleRateToEngineRate`, which classifies the selected
`SpeechSynthesisVoice` into `'google' | 'apple' | 'microsoft'` by sniffing `voice.voiceURI`
(`startsWith('apple')` / `startsWith('microsoft')`, else `'google'`), then looks up the matching
entry in a hardcoded `speechRatePairings` table (11 rows, `google` rate 0.8–1.3 in steps of 0.05,
each paired with the `apple`/`microsoft` rate empirically found to sound the same speed).
`src/lib/platform.ts` (`isIOS()`, added 2026-07-31) is deleted — engine detection from the voice
itself is more precise than OS detection, since the same OS can expose voices from different
engines.
**Rationale:** The 2026-07-31 "working TTS; still too fast on iOs" commit shipped a single
hardcoded `rate = 1.5`, tuned for Chrome/Google's voice, which then found "way too fast" on iOS
Safari's Apple voices. The three engines' `rate` parameters aren't linearly comparable — the same
numeric rate produces very different actual speeds — so a flat multiplier can't correct for it.
`speechRatePairings` was calibrated empirically: `textToSpeechTest.ts` (`testSpeechRates`) played a
fixed test sentence per language at a sweep of rate values (0.3–4) and timed wall-clock elapsed
duration per utterance; `speechRateAnalysis.ts` holds the raw timing data collected this way for
`nb-NO`/`nl-NL`/`es-ES`/`fr-FR`/`en-US`/`de-DE` across iOS and Windows voices. The
`speechRatePairings` table in `textToSpeech.ts` is the hand-derived result of matching elapsed-time
curves across engines from that data, not itself computed at runtime.
**Known gap:** `speechRatePairings` was calibrated primarily against iOS and Windows/Chrome voices;
`getVoiceEngine`'s `'google'` fallback covers both "actually Google" and "unrecognized engine" cases,
logged via `console.warn` when hit but not surfaced to the user. `textToSpeechTest.ts`/
`speechRateAnalysis.ts` are dev-only calibration scratch code — not imported by any production path,
kept in-tree as the source data/method for the table rather than deleted. Flagged in backlog.md for
a cleanup decision (keep as documentation of the method, move to a scripts/ location, or delete now
that the table is derived).
**Status:** Done.

### Known dead code from the TTS build: `AIThreadItemContent.tsx`

**Date:** 2026-08-01
**Note:** `AIThreadItemContent.tsx` was introduced in the 2026-07-31 "check for supported voices"
commit as the AI-message renderer (in place of inline JSX), anticipating a per-message speak/replay
button (`languageVoice` was already threaded into it). It was replaced by inline rendering again in
the very next commit ("working TTS; still too fast on iOs") once the speak trigger moved to a
`phase`-driven `useEffect` in `ThreadView` instead of a per-message button — the component is no
longer imported anywhere. Left in the tree, not deleted. Flagged in backlog.md for removal.

### Speech-rate pairing table: derivation method and edge-case handling finalized

**Date:** 2026-08-01
**Decision:** Refines the "Speech-rate correction: per-voice-engine lookup table" entry above with
the actual derivation method and three robustness fixes made while implementing it.

**Derivation method:** `speechRatePairings` is not per-language — it's built by averaging elapsed
playback time _per voice engine_ across all six tested languages (nb-NO, nl-NL, es-ES, fr-FR,
en-US, de-DE) at each tested rate, then interpolating between those averaged points to produce
the 0.05-step table. Google was chosen as the base scale (rather than iOS) because its
elapsed-time curve is the most linear of the three across the tested range. The table is scoped
to Google rates 0.8–1.3 specifically because that's the range where iOS and Windows-MS both have
real (non-extrapolated) matching data — below 0.8, Google's curve is slower than either other
engine's slowest tested rate, so there's no genuine match to interpolate toward.

**Known limitation carried into the table:** Windows-MS's elapsed time plateaus (stays roughly
flat) between rate ~0.8–1.2 before dropping again. This means the MS column of the pairing table
is a much steeper, less linear mapping than the Apple column, particularly at the high end
(Google 1.15 → 1.2 corresponds to MS rate jumping from ~0.79 to ~1.25). Not a bug in the table —
it reflects a real discontinuity in how the MS engine's `rate` parameter behaves.

**Code fixes made alongside the table (`src/lib/textToSpeech.ts`):**

- `googleRateToEngineRate` now rounds the incoming rate to the nearest 0.05 step
  (`roundToRateStep`) before the `speechRatePairings` lookup. Guards against float-equality
  misses if a future variable-rate input (e.g. a user-facing speed slider, see backlog.md) produces
  a value like `0.95000000000000002` instead of the literal `0.95` in the table.
- `divideIntoSentences` now trims each sentence before filtering empties, so whitespace-only
  segments (e.g. from `"Hi. . Bye."`) don't produce a near-silent empty utterance.
- `speakMessage` now checks for zero sentences after sanitizing/splitting/filtering and calls
  `onSpeechEnd()` immediately in that case, rather than silently doing nothing. Without this, an
  empty message would leave the caller waiting on a callback that never fires.

**Status:** Done.

---

## Recognition preview shown as a speech balloon (2026-08-02)

### Shared `SpeechBalloon` component; preview visible beyond `listening`

**Date:** 2026-08-02
**Decision:** The in-progress STT transcript preview (`SpeechResults.tsx`) is now visually a chat
bubble, not a plain status `div`. The message-bubble styling previously inline in
`ThreadView.tsx`/`ThreadView.module.css` (`.message`/`.messageFromAi`/`.messageFromUser`) is
extracted into a new shared component, `SpeechBalloon.tsx` (+ `SpeechBalloon.module.css`), taking
`author`/`tag` props. Both `ThreadView` (real transcript items) and `SpeechResults` (the live,
not-yet-sent preview) render through it, with `SpeechResults` always passing `author="user"`.
Visibility is widened at the same time: a new `shouldShowRecognitionPreview(phase)` helper in
`chatReducer.ts` gates rendering on `listening`, `listeningStopped`, `listeningTimedOut`, and
`readyForSendingUserReply` — not just `listening` as before.
**Rationale:** Styling the live preview like a real message bubble makes it read as "this is what
you're about to send," consistent with how sent messages already look in `ThreadView`, rather than
a disconnected status line. Widening visibility beyond `listening` keeps that preview bubble on
screen through the stop/transcript-review window (`listeningStopped` →
`readyForSendingUserReply`) instead of it disappearing the moment listening stops, which would
otherwise leave the transcript-before-send step (see the 2026-07-28 STT integration decision)
with no visible content between "stop" and "send." Including `listeningTimedOut` in the gate is
scaffolding consistent with that state's existing deferred status (see 2026-07-27) — no timeout
dispatch site exists yet, but the preview will already be visible once one does.
**Not a reversal:** the transcript is still display-only, sent unedited — this only changes when
and how the in-progress preview is shown, not the no-review-step policy (2026-07-19) or the
live-interim-transcript mechanism (2026-07-29).
**Status:** Done.

---

## AI-pending speech balloon (2026-08-02)

### `waitingForAI` renders a pending balloon in `ThreadView`, delayed by 500ms

**Date:** 2026-08-02
**Decision:** `ThreadView.tsx` now shows an ellipsis (`…`) inside an `author="ai"` `SpeechBalloon`
while `phase.status === 'waitingForAI'`. A `useEffect` keyed on `phase` starts a 500ms `setTimeout`
before flipping `showAIPendingBalloon` to `true`; the effect's cleanup clears the timer and resets
the flag to `false` on any phase change (including leaving `waitingForAI` early).
**Rationale:** Indicates the loading state while waiting for the AI response, reusing the same
`SpeechBalloon` component (see the 2026-08-02 recognition-preview entry above) so the pending
indicator reads as a chat bubble consistent with real messages rather than a separate UI element.
The 500ms delay avoids a flash of the balloon on fast responses.
**Status:** Done.

### Persona wording: "stranger"/topic guidance broadened, superseding the 2026-07-17 decision

**Date:** 2026-08-02 (supersedes "Persona: generic friendly acquaintance, not a specific character",
2026-07-17)
**Decision:** `freeformChatWithAIStart`'s instruction changes from "an acquaintance" /
"discussing hobbies or where the user lives" to "a stranger" / "a topic suitable for a conversation
that goes further than smalltalk." `freeformChatWithUserStart`'s instruction is shortened to "an
acquaintance or a stranger," dropping the topic-picking guidance (moot for this scenario, since the
user opens). The `scenarios` array's placeholder entry is untouched, still using the original
acquaintance/hobbies wording.
**Rationale:** The acquaintance-only framing kept the AI defaulting to shallow smalltalk topics,
which is weak practice material for a language-sparring app. Broadening to include strangers and
explicitly steering past smalltalk should produce more varied, useful conversation topics.
**Status:** Done. The generic, friendly, non-specific persona framing still stands; the
acquaintance-only framing and shallow-topic guidance are superseded.

## Reply-phase UX flagged for redesign before visual design pass

**Date:** 2026-08-02
**Decision:** Before the visual/UI design pass (see 2026-07-27 sequencing decision), the
reply-phase interaction flow — what happens after the AI's turn, and what controls are available
during listening — will be redesigned. This becomes the next work item, ahead of visual design.
**Rationale:** Current flow needs too many clicks during the reply phase. This is core
conversational-loop functionality, not styling, so it should be settled first — consistent with
the existing decision to only style once interaction design has stopped churning.
**Open questions raised (not yet resolved — needs a scoping session before implementation):**

- Auto-start listening immediately after the AI's turn ends, instead of waiting for a "Reply"
  button click
- Value of `listeningTimedOut`: raised for reconsideration — no clear added value identified so
  far, but not decided. Supersedes nothing yet; the existing 2026-07-27 "deferred to STT work"
  decision stands until this is resolved one way or the other.
- Additional in-listening actions under consideration:
  - **Send** — send immediately
  - **Cancel** — clear the in-progress transcript, return to a "start reply" state (implies a
    reply-start button/trigger is still needed for this path)
  - **Edit** — stop listening, let the user manually edit the transcript, then send
    **Status:** Open. Not scoped or designed — this entry only records that a redesign is queued and
    lists the discussion points to resolve, per "define done" — no implementation starts until
    explicit done criteria exist for whatever gets decided.

---

## Derived-state predicates in `chatReducer.ts` (2026-08-04)

### `canSendReply`/`hasError` turned into type predicates; new plain-boolean helpers added

**Date:** 2026-08-04
**Decision:** Resolves the backlog item flagged 2026-08-03. `canSendReply` and `hasError` (in
`chatReducer.ts`) are now typed as `phase is Extract<ChatPhase, { status: '...' }>` instead of
plain `boolean`, so calling them narrows `state.phase`/`phase` at the call site. Callers that read
a field only present on that phase's variant — `ChatConversation.tsx`'s `handleSendUserMessage`
(`state.phase.transcript`, after `canSendReply(state.phase)`) and `ErrorArea.tsx` (`phase.error`,
after `hasError(phase)`) — now call the helper directly in the `if` guard instead of comparing
`phase.status !== '...'` and relying on TS to narrow the raw comparison.
Six new plain-`boolean` helpers were also added as part of this refactor — `isAITurnSpeaking`,
`isWaitingForAI`, `shouldAutoScrollThread` (2026-08-03, alongside the ThreadView work below) and
`chatStartIsPending`, `listeningIsStopped`, `isListening` (2026-08-04) — and existing raw
`phase.status !== '...'`/`phase.status === '...'` comparisons across `ChatConversation.tsx`,
`ControlsArea.tsx`, `MockSTT.tsx`, `SpeechResults.tsx`, `SpeechToText.tsx`, and `ThreadView.tsx`
were replaced with calls to these and the pre-existing helpers, even where no narrowing was needed
— for consistency with the narrowing predicates and to keep phase checks readable/DRY across the
component tree.
**Rationale:** The backlog item's originally-scoped fix only required predicate types for
`canSendReply`/`hasError`, the two call sites that actually access a narrowed field. Extending the
same helper-function pattern to every remaining raw `phase.status` comparison (rather than leaving
predicate-typed and plain-boolean checks inconsistently mixed) keeps all phase checks going through
`chatReducer.ts`'s exported helpers as the single source of truth for phase semantics.
**Status:** Done. `tsc --noEmit` confirms clean.

---

## Reply-phase UX redesign resolved (2026-08-04)

### STT transcript review/edit step: reopened — "deferred, reconsidering," not "not needed"

**Date:** 2026-08-04
**Decision:** The 2026-07-19 "STT transcript review step: not needed for MVP" decision is
reclassified from closed to **deferred, reconsidering**. Editing is not being designed or built in
this round, but it is no longer considered a settled no.
**Rationale:** Hands-on use of the app surfaced a real want for an edit capability that spike-era
STT-accuracy testing didn't anticipate — the original decision was scoped around "is STT accurate
enough to skip a correction step," not "will a user ever want to change what they said before
sending it," and those turned out to be different questions. Scope for a future edit feature (does
it hand-edit text vs. re-run STT, does it reverse the read-only-display precedent from 2026-07-19)
is real design surface, not yet worked through, so building it now would be guessing rather than
deciding. Tracked as a backlog item instead.
**Status:** Open — reconsideration only, no design started.

### `listening` phase: `Send`/`Cancel` replace `Stop listening`, single-click-to-outcome

**Date:** 2026-08-04
**Decision:** During `listening`, the primary action is replaced by two live actions: `Send` and
`Cancel`.

- `Send` dispatches `STOP_LISTENING` with payload `{ intent: 'send' }` (single action with an
  `intent` field, not separate action types per intent — see rationale below).
  `listening` → `listeningStopped`, which is now unambiguously "stopped in order to send" (no
  `intent` needs to live on the phase itself, since there's only one reason to reach it). Once the
  transcript settles (existing `TRANSCRIPT_CREATED`/`TRANSCRIPT_EMPTY` mechanics, unchanged), flow
  continues into `readyForSendingUserReply` as before.
- `Cancel` dispatches a new action, `CANCEL_LISTENING`, going `listening` → `readyForUserReply`
  directly — no intermediate phase, no waiting on STT to settle a final transcript.

**Rationale:** Collapses "Stop listening" + "Send message" into one click for the common case, and
adds a previously-missing way to abandon an in-progress reply without ending the whole session.
`STOP_LISTENING` keeps a single action type with an `intent` payload (rather than one action per
intent, e.g. `STOP_LISTENING_TO_SEND`) for consistency with the existing payload convention already
used elsewhere in this reducer (e.g. `TRANSCRIPT_CREATED`), and to leave a seam for a future Edit
intent (`intent: 'edit'`) to reuse the same stop-and-wait mechanics without a new action type —
not because Edit is being built now (see the entry above; it isn't).
`Cancel` skips the stop-and-wait path entirely, rather than sharing `listeningStopped`, because it
discards the result either way and has no reason to wait on transcript settlement — it should use
`recognition.abort()` rather than `recognition.stop()`, since `abort()` is the immediate,
don't-wait-for-a-final-result call, matching what `Cancel` actually needs.
**Open verification item:** `abort()` vs. `stop()` cross-browser behavior hasn't been checked yet.
Given the existing iOS Safari `onresult`-after-`stop()` quirk found during initial STT integration
(2026-07-29), `abort()` is not assumed to be a safe drop-in without testing on the same
problem browsers.
**Status:** Design decided. Not yet implemented.

### `End session` reachable everywhere except `listening` — deliberate narrowing of the 2026-07-27 `STOP_CHAT`-from-every-phase guarantee

**Date:** 2026-08-04
**Decision:** The secondary "End Conversation"/"End this session" actions are unified under one
label, "End session," reachable from every phase except `listening`. During `listening`, ending the
session is not directly available — the user must `Cancel` (→ `readyForUserReply`) first, then end
from there.
**Rationale:** The 2026-07-27 decision made `STOP_CHAT` handled from every reducer phase
specifically to close a gap where mid-turn ending silently no-opped — that guarantee is being
deliberately narrowed for this one phase, not accidentally dropped as a side effect of this
redesign. Judged low-frequency (a user mid-recording wanting to abandon the entire session, not
just the in-progress reply) and not worth the added complexity of supporting session-end from
inside an active recognition session. `Cancel` → `readyForUserReply` → `End session` is two clicks,
the same number as the current `End Conversation` → `End this session` path, so this isn't a net
capability loss in click terms, only in directness from within `listening` specifically.
**Status:** Decided. Not yet implemented.

### `listeningTimedOut`: superseded, not merely parked — no app-enforced timeout planned

**Date:** 2026-08-04 (supersedes "`listeningTimedOut` deferred to STT work," 2026-07-27)
**Decision:** There is no plan to build an app-enforced listening timeout.
`recognitionShouldBeActiveRef` keeps Web Speech API recognition open indefinitely by design, and
`SpeechRecognition` itself does not time out on its own.
**Rationale:** The 2026-07-27 decision deferred `listeningTimedOut` pending real STT integration,
on the assumption a timeout mechanism would eventually be built once STT existed to test it
against. With `Send`/`Cancel` now covering both ways a user can deliberately end a reply (per the
`listening` phase decision above), and recognition designed to stay open rather than lapse, the
premise that a timeout is still needed no longer holds — this isn't "still waiting to build it," it's
"probably won't build it as originally conceived."
**Status:** Superseded. If a real need for a timeout resurfaces later, it should be scoped fresh
against the current `Send`/`Cancel` flow, not resumed from the original `listeningTimedOut` design.

---

## Reply-phase UX redesign implemented (2026-08-04) — corrections to the design above

Implementation surfaced four places where the built behavior diverges from the design decided
earlier the same day (see "Reply-phase UX redesign resolved" above). Caught by comparing the code
against these docs after implementation, not during a spike — logged here rather than silently
editing the entries above, per this project's documented decisions.

### `chatEnded` phase and `STOP_CHAT` action removed entirely — ending a session is always a direct `onEndSession` call

**Date:** 2026-08-04 (supersedes "`STOP_CHAT` handled from every reducer phase," 2026-07-27, and the
`chatEnded` half of "`ended` renamed to `chatEnded`," 2026-07-30)
**Decision:** `STOP_CHAT` and the terminal `chatEnded` phase are removed from `chatReducer.ts`
entirely — not renamed, not superseded-but-present, gone. "End session" (`ControlsArea.tsx`) now
calls the `onEndSession` prop directly from whichever phase it's visible in (see the input-flow
gating entry below), the same way `error`-phase recovery already worked pre-redesign. There is no
longer an intermediate "conversation has ended" screen between clicking "End session" and
`ChatContainer` unmounting `ChatConversation` back to `ChatSetup`.
**Rationale:** Checked before deciding this wasn't a silent regression: the terminal `chatEnded`
phase's only value was showing that intermediate screen — the abort-in-flight-request/stop-TTS/
stop-STT cleanup implied by the original 2026-07-22 "End conversation (always live)" design was
never actually built against `STOP_CHAT` in the first place (that 2026-07-27 entry only ever
described a phase transition to `ended`, nothing that touched `abortControllerRef` or called
`cancelSpeech`/recognition stop directly). TTS cleanup already happens for free via React's normal
unmount lifecycle (`ThreadView.tsx`'s `aiTurnSpeaking` effect cleanup calls `cancelSpeech()`
regardless of why the component unmounts), and STT was never reachable while "End session" is
visible (see input-flow gating below) — so removing the phase loses only the intermediate screen,
not any cleanup behavior. Judged not worth keeping a phase/action pair whose sole purpose was a
screen nobody asked for.
**Consequence:** requirements.md's "Hidden AI-opening instruction..." and state-model checklist
items, and status.md's phase-count references, need updating to the current 10-phase model (see
below). The in-flight-fetch-abort gap (`abortControllerRef` never `.abort()`-ed on session end) is
a pre-existing gap, not introduced here — flagged in backlog.md if it's ever worth closing.
**Status:** Done.

### Cancel implemented with an intermediate `cancellingListening` phase — supersedes "no intermediate phase"

**Date:** 2026-08-04 (supersedes the "no intermediate phase, no waiting on STT to settle" line in
the `listening`-phase `Send`/`Cancel` design above)
**Decision:** `CANCEL_LISTENING` transitions `listening` → a new `cancellingListening` phase, not
straight to `readyForUserReply`. `SpeechToText.tsx` reacts to `cancellingListening` by calling
`recognition.abort()`; only once the real `onend` event fires does it call the new
`onListeningCancelled` prop, which dispatches a new `LISTENING_CANCELLED` action that finally moves
`cancellingListening` → `readyForUserReply`.
**Rationale:** The original design's premise — that Cancel could skip waiting on STT — didn't survive
contact with the real Web Speech API: `recognition.abort()` is still async and its effects (including
whether a stray `onresult` fires first, per the existing iOS Safari quirk noted in the original
design's "open verification item") can only be observed via `onend`. There's no way to "not wait" for
a browser event that hasn't fired yet without risking a race. Mirrors the existing `listening` →
`stoppingListening` → `readyForSendingUserReply`-style pattern (stop-and-wait, not stop-and-assume)
already used for Send, rather than inventing a second, different waiting mechanism.
**Status:** Done. Keeping this design going forward — not revisiting the "no intermediate phase"
approach.

### Phase names finalized during implementation: `stoppingListening`, `sendingUserReply`; `intent` carried on `stoppingListening`

**Date:** 2026-08-04
**Decision:** The phase referred to as `listeningStopped` in the design entries above shipped as
`stoppingListening`; `readyForSendingUserReply` shipped as `sendingUserReply`. `stoppingListening`
carries `intent: StopIntent` (`'send' | 'edit'`) on the phase object, contradicting the design
entry's "no intent needs to live on the phase itself" line.
**Rationale:** Naming: `stoppingListening`/`cancellingListening` read consistently as a matched
pair (both name the in-progress action, not a past-tense state) once `cancellingListening` existed
as a sibling phase — `listeningStopped` next to `cancellingListening` would have mismatched tense.
Keeping `intent` on the phase (rather than dropping it, as the design assumed) costs nothing now and
keeps the seam for a future Edit intent concrete rather than needing to be re-added later.
**Known gap carried over, not fixed now:** `stoppingListening`'s `TRANSCRIPT_CREATED` handler
only has an explicit branch for `intent === 'send'`; any other `intent` value falls through
(no `break`/`return`) into the `TRANSCRIPT_EMPTY` branch, silently discarding the transcript. Inert
today — nothing dispatches `intent: 'edit'` yet — but will need an explicit branch (or a
different design) before Edit is built. Tracked in backlog.md against the existing STT-edit item
rather than fixed speculatively now.
**Status:** Done.

### `End session`/`Cancel` visibility gated by the existing `userIsInInputFlow` helper across the whole input flow, not just `listening`

**Date:** 2026-08-04 (supersedes "reachable from every phase except `listening`" in the `End
session` design entry above)
**Decision:** `canStopSession` (gates "End session") and `shouldShowCancelButton` (gates "Cancel")
both key off the same `chatReducer.ts` helper, `userIsInInputFlow`, which covers `listening`,
`stoppingListening`, `cancellingListening`, and `sendingUserReply` — not `listening` alone. So "End
session" is hidden, and "Cancel" shown, across the entire stop/cancel/send-in-flight window, not
just while recognition is actively listening.
**Rationale:** The transitional phases (`stoppingListening`, `cancellingListening`,
`sendingUserReply`) are all mid-flight the same way `listening` is — there's no clean way to "end
the session" while recognition is still settling a result or a message is already being sent, so
hiding "End session" only during literal `listening` and re-showing it during those transitional
phases would flash the button on and off for a few hundred ms with nothing useful to do with it.
Sharing one helper (`userIsInInputFlow`) for both gates, instead of two separately-scoped checks,
also keeps "what counts as mid-reply" defined in one place.
**Status:** Done. Keeping this design going forward — not narrowing to literal `listening` only.

---

## Next.js 16 → 15 downgrade (2026-08-04)

### Downgrade `next`/`eslint-config-next` from 16.2.11 to 15.5.22

**Date:** 2026-08-04
**Decision:** Downgraded `next` and `eslint-config-next` to the latest 15.x (`15.5.22`) on branch
`nextjs-downgrade`, done via `npm install next@15.5.22 eslint-config-next@15.5.22` (not a manual
`package.json` edit).
**Rationale:** Revert to the stable/well-documented major version. Checked first that nothing in
the repo depended on 16-only surface: no `middleware.ts`/`proxy.ts` exists (the 16 rename is moot),
`next.config.ts` only sets `allowedDevOrigins` (no Cache Components/`reactCompiler`/other 16-only
experimental keys), and a grep of `src/` found no use of `use cache`, `cacheLife`,
`unstable_cache`, or `next/after` — App Router caching APIs whose availability varies across the
14/15/16 line, so their absence sidesteps needing to check compatibility per version. Installed
TypeScript (`5.9.3`) is well below the `<7.0`
compatibility-patch threshold, so that was a non-issue too. Turbopack reverts to opt-in (v15
default is webpack); no script changes needed since `dev`/`build` never passed `--turbopack`.
**Status:** Done. Build (`npm run build`) and dev server (`npm run dev`) both verified working on
15.5.22.

### `eslint.config.mjs` rewritten to use `FlatCompat`, not direct flat-config imports

**Date:** 2026-08-04
**Decision:** `eslint-config-next@15.x` ships legacy `.eslintrc`-style config objects
(`module.exports = { extends: [...], plugins: [...] }`), not flat-config arrays — unlike v16, whose
`eslint-config-next/core-web-vitals` and `/typescript` subpaths exported ready-to-spread flat arrays
(the original `eslint.config.mjs` did `...nextVitals`/`...nextTs` directly). `eslint.config.mjs` now
uses the `FlatCompat` bridge from `@eslint/eslintrc` (`compat.extends("next/core-web-vitals",
"next/typescript")`), matching Next's own documented v15 flat-config recipe.
**Rationale:** No other way to consume v15's legacy-format shareable configs under ESLint 9's flat
config without either hand-porting the rules or wrapping them. `@eslint/eslintrc` was initially left
out of `package.json`, relying on it being hoisted transitively (a dependency of
`eslint-config-next`) — but since `eslint.config.mjs` imports `FlatCompat` from it directly, that's
an undeclared dependency on hoisting behavior, not guaranteed by npm's resolution rules. Added as an
explicit `devDependency` and regenerated the lockfile.
**Status:** Done. `npm run lint` runs clean (no crash) via the CLI.

### `@next/eslint-plugin-next` version conflict with `@jaronbarends/frontend-tooling-config`

**Date:** 2026-08-04
**Decision:** Bumped the externally-maintained `@jaronbarends/frontend-tooling-config` package
(this repo's shared ESLint/Prettier config, published separately) from `1.0.4` to `1.0.6`, to widen
its `@next/eslint-plugin-next` peer dependency from a hard `^16.0.0` pin down to `^15.0.0` (published
as `1.0.5`), then again to disable core ESLint's `no-undef` rule for `.ts`/`.tsx` files in `base.mjs`
(published as `1.0.6`).
**Rationale:** `eslint-config-next@15.x`'s `plugin:@next/next/recommended` reference resolves via
plain Node module resolution (unlike its other sub-dependencies, which it pins explicitly via a
resolution hook) — so it was picking up whatever `@next/eslint-plugin-next` version got hoisted to
the top of `node_modules`. `frontend-tooling-config`'s hard `^16.0.0` peer dependency was hoisting
the v16 plugin, which ships flat-config-shaped rule objects (`name` field) that `FlatCompat`'s
legacy-schema validator rejects outright. Separately, `base.mjs` applied `js.configs.recommended`
(enabling core `no-undef`) to `.ts`/`.tsx` files without an override — this had apparently always
been present, but only surfaced once lint could run to completion past the plugin-version crash. It
produced false positives on any identifier used only in a type position sourced from an ambient
`.d.ts` global (`React.ReactNode`, `BodyInit`, `SpeechRecognition`, `SpeechSynthesisVoice`) — core
ESLint's `no-undef` has no concept of TypeScript's ambient global declarations, which is exactly why
typescript-eslint's own docs recommend disabling it for TS files and relying on `tsc` instead.
**Status:** Done. Both fixes are published and installed; `npm run lint` now reports only
legitimate, pre-existing findings (unrelated app-code issues and two known-broken spike/mock files,
see below) — confirmed by comparing before/after error counts (20 → 8 errors).
**Follow-up note, since resolved (was "Known follow-up, not fixed now"):** at the time this entry
was first written, `npm run build`'s lint pass appeared not to fail the build on ESLint errors
(build exited `0` despite printed `Error:`-level findings like `no-case-declarations`/
`no-fallthrough` in `chatReducer.ts` and a genuine parse error in `src/mock/real-chat-response.js`).
Re-tested 2026-08-05 after both of those specific error sources were independently fixed/removed
(see below): deliberately injecting a fresh lint error (an `any`-typed const in `src/lib/languages.ts`,
reverted after the test) now correctly fails `npm run build` with `Failed to compile.`. So this was
never a real build/lint integration bug — the two cited examples were the only errors present at the
time, and once both were gone there was nothing left to demonstrate the (non-existent) gap with.
**Also found, since removed:** `src/mock/real-chat-response.js` was not valid JavaScript — it
appeared to be pasted console/debug output saved with a `.js` extension, not an actual module.
Deleted in `70a2cd0` ("fix more linting errors; remove real-chat-response.js", 2026-08-04) once it
was confirmed unused.

### Downgrade branch merged; lint-now-runs-to-completion follow-up fixes

**Date:** 2026-08-05
**Decision:** `nextjs-downgrade` merged to `main` (`44c5012`). Three follow-up commits fixed
`react-hooks/exhaustive-deps` violations that only became visible once lint could run to completion
past the crash described above:

- `ChatConversation.tsx` (`0796323`, `35726cf`): the mount effect that triggers chat start no longer
  depends on a locally-defined `startChat` function. Instead, a `startChatRef` is kept current by a
  separate effect with **no** dependency array (deliberately runs every render, keeping the ref's
  closure fresh over `chatConfig`/`startChatWithAI`/`startChatWithUser`), and the start-triggering
  effect only depends on `state.phase`, calling `startChatRef.current()`. Avoids the alternative
  (`useCallback`-wrapping `startChat` and listing it as a dependency), which would re-run the
  start-trigger effect any time the callback identity changed rather than only on the intended
  `state.phase` change.
- `SpeechToText.tsx` (`35726cf`): the recognition-init effect's dependency array is intentionally
  emptied (was `[languageTag]`), with an `eslint-disable-next-line react-hooks/exhaustive-deps` and
  a comment explaining why: if `languageTag` changes, only `recognition.lang` would need
  reassigning, not recreating the whole recognition object; the handlers assigned inside
  `initSpeechRecognition` close over refs (read via `.current`, never stale) and over callback props
  that themselves only forward to a stable `dispatch`.
- `ThreadView.tsx` (`329ea69`): the TTS-trigger effect's dependency array gained `threadItems`,
  `languageVoice`, `onAISpeechEnd` (was `[phase]` only); the autoscroll effect gained `phase` (was
  `[threadItems, showAIPendingBalloon]` only) — both now list their actual dependencies instead of a
  partial subset.

**Rationale:** These weren't cosmetic — `eslint-plugin-react-hooks`'s `exhaustive-deps` rule is a
real correctness check (stale closures over props/state), not just a style rule; it simply couldn't
run before the FlatCompat/plugin-version fixes above let lint complete without crashing.
**Status:** Done. `npm run lint` and `npm run build` both clean on `main` as of `44c5012`.

---

## Unsupported-`SpeechRecognition` handling (2026-08-05)

### Starting a conversation now requires `SpeechRecognition` support; the old in-conversation error path is removed

**Date:** 2026-08-05
**Decision:** Browser support for the Web Speech API's `SpeechRecognition` constructor is now
checked on `ChatSetup`, not discovered mid-conversation. New `src/lib/speechRecognition.ts`:

- `speechRecognitionIsSupported()` — reads `window.SpeechRecognition ?? window.webkitSpeechRecognition`
  and returns whether a constructor exists; returns `false` (via an internal `typeof window ===
'undefined'` guard) when called during SSR.
- `getCrossBrowserSpeechRecognition()` — returns `new Constructor()` if supported, `undefined`
  otherwise. `SpeechToText.tsx`'s `initSpeechRecognition` now returns `SpeechRecognition | undefined`
  instead of throwing when unsupported; `startListening`/`stopListening`/`cancelListening` already
  used `recognitionRef.current?.` optional chaining, so an `undefined` recognition object is a
  silent no-op rather than a crash. In practice this path shouldn't be reachable — `ChatSetup` gates
  the button below — this is defense-in-depth, not the actual gate.
- `useSpeechRecognitionIsSupported()` — a `useSyncExternalStore` wrapper around
  `speechRecognitionIsSupported`, with a `subscribe` that never fires (support doesn't change mid-
  session, so there's nothing to subscribe to) and `getServerSnapshot` hardcoded to `false`.

`ChatSetup.tsx` calls the hook, shows a message ("This app needs speech recognition; this browser
does not support that. Use another browser (like Chrome, Edge or Safari)") when unsupported, and
disables the "Start conversation" button on the same condition (alongside the existing
`speechSupportIsChecked` check — an unrelated TTS-voice-detection flag from `ChatContainer`, not to
be confused with this STT check despite the similar name). `ChatConversation.tsx`'s `onError` prop
on `SpeechToText` and its `handleError` (`// TODO decide how to handle non-api errors` →
`throw new Error(message)`) are removed entirely, since the one thing that prop existed to report
(recognition unsupported) can no longer occur once a session has started.
**Rationale:** Discovering "this browser can't do STT" only after the user has already picked a
language/starter and landed in a live conversation is a worse failure mode than blocking it upfront
— STT is a hard MVP requirement (see 2026-07-17 decision), so a browser without it can't run a
session at all, and there's no partial/degraded mode to fall back into.

### SSR/CSR mismatch fix: `useSyncExternalStore`, not a direct function call

**Date:** 2026-08-05
**Decision:** The first version of this check called `speechRecognitionIsSupported()` directly in
`ChatSetup`'s render body. Superseded same-day by the `useSyncExternalStore`-based
`useSpeechRecognitionIsSupported()` hook described above.
**Rationale:** `chat/page.tsx` is a Server Component tree — `ChatSetup` renders once on the server
first. `window` doesn't exist there, so a direct call would need to assume `false` during SSR and
would only get the real answer on client re-render; without `useSyncExternalStore`, React has no way
to know the SSR-rendered value is provisional, and React 19 hydration would throw a mismatch error
the moment a browser that _does_ support `SpeechRecognition` hydrates to a different boolean than
what was server-rendered. `useSyncExternalStore`'s `getServerSnapshot` param exists exactly for this
case: it tells React explicitly what value to expect during the SSR pass, so hydration reconciles
cleanly and the real client value takes over on mount.
**Status:** Done. Implemented identically on two branches independently (commits `9141751`/`bbded6f`
and `c43dbc3`/`cab5c63`), merged together in `442b350` with no conflicts since both diffs were
identical.

---

## Visual/UI design pass (2026-08-06–2026-08-09)

Implements the pass sequenced-but-undesigned in the 2026-07-27 "Visual/UI design phase sequenced
after core loop" decision above. Landed as branch `visual-design` (PR #14, merged `497f7da`,
2026-08-08), followed by same-day/next-day follow-on branches/commits (`add-segmented-control`,
`language-picker-input-in-label`, `button-layout`, `add-loader`) merged straight to `main` through
2026-08-09. Covers design tokens, a small shared component set, and restyling of the setup screen
and conversation loop built earlier. Does not cover evaluation UI (doesn't exist yet) or a full
accessibility pass (see "Known gaps" at the end of this section).

### Design tokens: OKLCH color scale + spacing/type/border/animation primitives

**Date:** 2026-08-06
**Decision:** New `src/styles/settings/` token files (`colors.css`, `sizes.css`, `fonts.css`,
`type.css`, `borders.css`, `animation.css`), imported via `settings.css`:

- **Colors** (`colors.css`): three 11-step primitive OKLCH ramps (`--color-pink-50..950`,
  `--color-blue-50..950`, `--color-gray-50..950`), plus `--color-white`/`--color-red`/
  `--color-red-subtle`. Semantic tokens (`--color-text-*`, `--color-bg-*`, `--color-border-*`) map
  onto specific ramp steps; a further "component colors" tier (`--color-bg-page`,
  `--color-text-default`, `--color-text-label`, `--color-focus-outline`) maps semantic tokens onto
  concrete component roles. Two ramp steps (`--color-pink-900`, `--color-gray-900`/`-950`) carry
  inline comments recording hand-tuning against an original design reference — the generated OKLCH
  formula didn't match by eye, so specific values were nudged and the original formula-generated
  value kept in the comment.
- **Sizing** (`sizes.css`): a spacing scale (`--size-2` … `--size-64`, rem-based) and a radius scale
  (`--radius-4` … `--radius-16`, plus `--radius-pill`/`--radius-circle`), with one component-level
  token (`--radius-button: var(--radius-pill)`).
- **Fonts** (`fonts.css`/`type.css`): two self-hosted variable fonts — Baloo 2 (display/heading/
  button face) and Work Sans (body/label face) — loaded via `@font-face` from `public/fonts/`, each
  declared at multiple `font-weight` values pointing at the same variable-font file (browsers select
  the right weight from the single file per the declared range). `type.css` layers primitive font
  tokens into semantic ones (`--font-family-heading`/`--font-family-button`/`--font-family-label`,
  `--font-weight-heading`/`--font-weight-button`, `--line-height-heading`/`--line-height-body`).
- **Borders** (`borders.css`): a single border-width primitive, a focus-outline shorthand token
  (`--focus-outline`, combining width/style/`--color-focus-outline`), and two "bevel" tokens
  (`--bevel-small`/`--bevel-large`) used for button/control edge styling.
- **Animation** (`animation.css`): two duration tokens (`--duration-instant: 0.1s`,
  `--duration-near-instant: 0.2s`) — no easing-curve tokens yet.

**Rationale:** Follows the project's "CSS tokens form a closed scale" rule (CLAUDE.md) — primitive
ramps feed semantic tokens feed component tokens, so component CSS never hardcodes a raw color/size
value. OKLCH specifically wasn't spike-tested or compared against alternatives here; picked as the
primitive color space without a documented alternatives comparison in this log.
**Status:** Done. This is the first `design.md`-equivalent content the project has — the "timing
decided, content open" status this decision log carried since 2026-07-27 is now resolved. There is
still no separate `design.md` file; token values live directly in `src/styles/settings/`.

### New shared component set: `Button`, `Loader`, `Feedback`, `Icon`, `PageHeading`, `Logo`

**Date:** 2026-08-06–2026-08-09
**Decision:** Small `src/components/` library, styled against the tokens above:

- **`Button`** (`src/components/button/Button.tsx`) — `variant: 'primary' | 'secondary' |
'feedback'`, optional `fontSize: 'medium' | 'large'`. Renders a Next.js `Link` when given an
  `href`, a native `<button>` otherwise (same class list either way) — one component covers both
  link-styled-as-button and real-button cases rather than two separate components.
- **`Loader`** (`src/components/Loader.tsx`) — three-dot loading indicator, `role="status"` +
  required `ariaLabel` prop (no default text, forcing each call site to state what's loading).
- **`Feedback`** (`src/components/Feedback.tsx`) — typed inline banner with an `Icon`; `type` is
  currently typed as the literal `'error'` only, with `'warning' | 'info' | 'success'` left as a
  code comment for when they're needed, rather than speculatively building all four now.
- **`Icon`**/`getIconByName` (`src/components/icon/Icon.tsx`, `src/lib/getIconByName.ts`) — a
  name-keyed icon registry (`ICONS`) mixing two sources: `react-icons/fa6` glyphs (`volumeMute`,
  `error`) and six inline-SVG flag icons imported as React components via `@svgr/webpack` (added to
  `next.config.ts`'s webpack rules, guarded per commit `1f57908` against a `resourceQuery.not`
  access issue). `getFlagIconName(languageTag)` derives a flag from a BCP-47 tag's region subtag
  (`nb-NO` → `flag-no`), returning `undefined` for languages with no matching flag asset rather than
  guessing one.
- **`PageHeading`**/**`Logo`** (`src/components/PageHeading.tsx`, `src/components/Logo.tsx`) — a
  thin layout wrapper (logo + heading content) used once so far, on `ChatSetup`.

**Status:** Done. `Feedback` was initially used in one place (`SetupForm`'s
speech-recognition-unsupported message); `ErrorArea.tsx` (the conversation-loop error message) also
uses it as of 2026-08-09 (see "`ErrorArea` restyled with `Feedback`" below) — the "Error UI polish
only" open item from 2026-07-27 is now resolved.

### Setup screen restyled: `SegmentedControl` extracted, `LanguagePicker` gets flags + no-voice icon, `ChatSetup` split into layout + `SetupForm`

**Date:** 2026-08-07–2026-08-08
**Decision:**

- The inline AI/user starter radio pair (built into `ChatSetup.tsx` per the 2026-07-30 setup-screen
  decision) is extracted into a new generic `SegmentedControl<T>` component
  (`src/app/chat/chatSetup/components/SegmentedControl.tsx`) — a labeled `fieldset` of radios styled
  as a segmented control, with a CSS-driven selection-indicator animation
  (`--duration-near-instant`). Generic over the option value type, not starter-specific, so it isn't
  coupled to `'ai' | 'user'`.
- `LanguagePicker` now renders a per-language flag icon (via `getFlagIconName`) and, once
  `speechSupportIsChecked` is true, a `volumeMute` warning icon next to any language with no
  detected TTS voice (`supportedLanguageVoices[languageTag] === undefined`). This resolves the
  backlog item "voice-availability detection exists but nothing in the UI reacts to it yet" — see
  backlog.md. The radio `<input>` itself moved inside the `<label>` (previously a sibling) so the
  whole label area, not just the input, is the click/tap target.
- `ChatSetup.tsx` is split: it now only renders `PageHeading` (title + payoff line) and delegates the
  actual form to a new `SetupForm.tsx` (`src/app/chat/chatSetup/components/SetupForm.tsx`), which
  owns the `starter` state, both `LanguagePicker`/`SegmentedControl` instances, the
  speech-recognition-unsupported `Feedback` message, and the submit handler that builds `ChatConfig`
  and calls `onStartSession`. `ChatSetup` itself no longer holds any form logic — layout chrome
  (heading) separated from the form it heads.

**Rationale:** Not stated explicitly in commit messages beyond "extract"/"add" — read from the diffs
themselves. The `SegmentedControl` extraction and the `ChatSetup`/`SetupForm` split both follow the
project's existing pattern of pulling reusable/complex JSX into its own component (per CLAUDE.md's
"extract subcomponents when JSX is complex, reused, or has its own behavior").
**Status:** Done.

### `languages.ts`: `initiallySelected` field replaces positional default; dev-only Dutch override

**Date:** 2026-08-07
**Decision:** `Language` gains an optional `initiallySelected?: boolean` field. `languages.ts` now
marks Norwegian (`nb-NO`) as `initiallySelected: true` (previously the default was implicitly
"whichever is `supportedLanguages[0]`" — see 2026-07-30 setup-screen decision). `ChatContainer`'s
`getInitialLanguage()` looks up the flagged language, falling back to `supportedLanguages[0]` "should
never happen" if none is flagged. A `NEXT_PUBLIC_INITIAL_LANGUAGE_DUTCH` env var, checked first, can
override this to Dutch for dev convenience.
**Rationale:** Not stated in commit messages — read from the diff. Makes the default language an
explicit, named property instead of an accident of array order, which would otherwise silently break
if `languages.ts`'s entries were ever reordered (e.g. the alphabetical sort already applied for
display in `LanguagePicker`).
**Status:** Done.

### AI-pending indicator switched from a static balloon to `Loader`

**Date:** 2026-08-09
**Decision:** The `waitingForAI` pending balloon in `ThreadView.tsx` (added 2026-08-02, see "AI-
pending speech balloon" above) now renders `<Loader ariaLabel="Loading ai response" />` inside the
`SpeechBalloon` instead of static placeholder content. Chat balloons generally (`SpeechBalloon`) are
now sized to `fit-content` rather than a fixed/stretched width.
**Status:** Done.

### `ErrorArea` restyled with `Feedback`

**Date:** 2026-08-09
**Decision:** `ErrorArea.tsx` now renders `<Feedback type="error">{phase.error.error}</Feedback>`
instead of a plain `<div className={styles.component}>`. `ErrorArea.module.css` (which only held an
empty `.component {}` rule) is deleted.
**Rationale:** Closes the gap flagged right after the rest of the visual/UI design pass landed —
`Feedback` existed and was wired into `SetupForm` but not into the conversation-loop error state.
**Status:** Done. Resolves the "Error UI polish only" open item from 2026-07-27 — no Retry action
and no per-error-type differentiation are still the standing v0 policy, only the visual styling gap
is closed.

### Known gaps after this pass

- **No accessibility pass beyond what individual components picked up incidentally** —
  `SpeechResults`' live transcript already had `aria-live="polite"`/`aria-atomic="true"` before this
  pass; `Loader` and the language no-voice icon add `role="status"`/`role="img"` + `aria-label`
  on introduction. The backlog items "add lang attribute to speech output elements" and "add
  aria-live to output elements" (beyond the one already covered) are not addressed by this pass —
  still open, see backlog.md.
- **No dedicated `design.md`** — token values and component styling live in code
  (`src/styles/settings/`, `src/components/`), not in a separate design-decisions document. This log
  entry is the closest thing to one.

---

## `Starter` type moved to `scenarios.ts` (2026-08-09)

### `aiHasFirstTurn` boolean replaced by `starter: Starter`, type moved from `SetupForm` to `scenarios.ts`

**Date:** 2026-08-09
**Decision:** `Scenario.aiHasFirstTurn: boolean` is replaced by `Scenario.starter: Starter`, where
`type Starter = 'ai' | 'user'` is now defined and exported from `scenarios.ts`, not declared locally
in `SetupForm.tsx`. `ChatConfig.aiHasFirstTurn` becomes `ChatConfig.starter: Starter`.
`ChatConversation.tsx`'s check changes from `if (chatConfig.aiHasFirstTurn)` to
`if (chatConfig.starter === 'ai')`. `SetupForm.tsx` now imports `Starter` from `scenarios.ts` instead
of declaring its own copy.
**Rationale:** Two variables had drifted onto the same datapoint — `SetupForm.tsx`'s local `Starter`
type (used for its `SegmentedControl<Starter>` state) and `Scenario`/`ChatConfig`'s separate
`aiHasFirstTurn` boolean. `Starter` was judged the better name (states the two options directly
rather than encoding them as a boolean), and since "who starts" is a property of a `Scenario`, its
type belongs in `scenarios.ts` rather than in the form component that merely lets the user pick one.
**Status:** Done (commit `52e0677`). Supersedes the `aiHasFirstTurn` field name used in "Scenario/chat
config extracted into src/lib" (2026-07-28) and "Freeform chat modeled as two explicit `Scenario`
objects" (2026-07-30) above — those entries are left as originally written; current code uses
`starter`/`Starter`.

---

## Language level picker added (2026-08-10)

### User picks Beginner/Intermediate; CEFR level threaded into the system instruction

**Date:** 2026-08-10
**Decision:** New `LanguageLevelName`/`LanguageLevel`/`languageLevels`/`getLanguageLevelByName` in
`src/lib/language.ts` (commit `533dd5a`). `languageLevels` holds two entries: Beginner (CEFR
`A1/A2`) and Intermediate (CEFR `B1/B2`). `getBaseInstruction(language, level)` and
`getChatConfig(language, scenario, languageLevel)` both now take a `LanguageLevel`, and
`level.cefrLevel` is written directly into the AI's system instruction ("Answer in
`${languageTag}` at language level `${cefrLevel}`"). `ChatContainer` owns `level` state, defaulting
to Intermediate via `getLanguageLevelByName('Intermediate')`, and passes `selectedLevel`/
`onChangeLevel` down through `ChatSetup` → `SetupForm`, which renders the options as a
`SegmentedControl` built from `languageLevels.map(...)`.
**Rationale:** Not previously scoped as a scheduled backlog item — it existed only as two loose
"ideas to be decided upon" (`be able to choose language level`, `let app assert language level`)
and was picked up and built directly, outside the usual backlog.md → status.md → decisions.md
sequencing. Goal is letting conversations run at different proficiency levels rather than always
targeting the one CEFR band the original hardcoded instruction assumed.
**Manual verification, not automated:** CEFR level was manually tested and confirmed to change
model behavior meaningfully between Beginner and Intermediate. No automated evaluation exists yet
to catch a regression here (consistent with the project's known-weak-spot framing for LLM-based
behavior — see CLAUDE.md).
**Scope decision — Expert (C1/C2) postponed, not shipped:** A third level, `Expert`/C1/C2, was
drafted locally (added to the type union and the `languageLevels` array, which would have made it
immediately selectable in the UI since `SetupForm` maps over the full array) but pulled back out
before committing. Decided to ship with only Beginner/Intermediate for now and postpone the C1/C2
question, rather than exposing a picker option that hasn't had its own manual verification pass.
`languageLevels` stays a closed two-entry array until that decision is revisited.
**Consequence for backlog.md:** "be able to choose language level" is resolved by this entry.
"let app assert language level" is a different, still-open feature (the app inferring/adjusting
level itself, rather than the user picking it) — unaffected by this entry.
**Status:** Done — `languageLevels`/picker/system-instruction wiring implemented and committed
(`533dd5a`). Expert/C1/C2 explicitly deferred, not scaffolded in code.

### Data/type co-location rule: closed-union data stays with its type; open-ended lists get their own file

**Date:** 2026-08-10
**Decision:** `LanguageLevel`/`LanguageLevelName`/`languageLevels`/`getLanguageLevelByName` live
together in `language.ts` (added in PR #20), rather than splitting the data into a separate
`languageLevels.ts` the way `languages.ts` was split from `language.ts` on 2026-07-30.
**Rationale:** The 2026-07-30 split of `languages.ts` from `language.ts` was based on "the list is
config-like data, not a type definition" — but that reasoning applies specifically to open-ended
data: `Language` is an object shape with no closed set of valid values, so `supportedLanguages` can
grow independently of the type and belongs in its own file. `LanguageLevelName`, by contrast, is a
closed string-literal union defined in `language.ts` itself, and `languageLevels` is that union's
complete enumeration as runtime data — the array can't drift from the type without one telling you
the other broke. General rule going forward: if a file defines a closed string-literal union and an
array is that union's complete enumeration as data, keep them in the same file. If a file only
defines an open object shape, the list of instances is a separate, extensible concern and belongs in
its own file, mirroring the `languages.ts`/`language.ts` split.
**Known caveat:** this treats `LanguageLevelName` as closed for good. If levels become
user-configurable, or a third tier (e.g. A1, C1/C2) is added post-MVP such that the set no longer
feels fixed, revisit — `languageLevels` should move out to its own file at that point, same as
`languages.ts` did. (See the "Expert (C1/C2) postponed" scope decision in the entry above — that
tier is exactly the case that would trigger this revisit.)
**Manual verification note:** CEFR level was manually tested and confirmed to change model behavior
meaningfully between Beginner and Intermediate — no automated evaluation exists yet to catch
regressions here.
**Status:** Done — reflects current file layout as of PR #20; no code change made by this entry.

---

## Freeform scenarios generalized into an array; scenario-driven opening hint (2026-08-11)

### `Feedback` component gains an `info` type

**Date:** 2026-08-11
**Decision:** `Feedback`'s `type` prop widens from the single hardcoded `'error'` to
`FeedbackType = 'error' | 'info'`, with a `feedbackIconNames: Record<FeedbackType, IconName>` map
picking the icon per type (`info` → new `FaCircleInfo`, registered in `getIconByName.ts`). New
tokens `--color-text-info`/`--color-bg-info` (the latter aliasing `--color-bg-default`,
`--color-text-info` aliasing a new `--color-text-secondary-subtle`) back the `info` variant's
styling in `Feedback.module.css`.
**Rationale:** First concrete need for a non-error banner: the new per-scenario opening hint (see
below). `'warning'`/`'success'` remain un-added, per the type's original comment, until an actual
use case exists.
**Status:** Done.

### `Scenario.openingHint`: shown in `ThreadView` when the selected scenario has one

**Date:** 2026-08-11
**Decision:** New optional `Scenario.openingHint?: string`. `ChatContainer` reads
`scenario.openingHint` off the currently selected scenario and threads it down as a prop
(`ChatContainer` → `ChatConversation` → `ThreadView`); `ThreadView` renders it as an
`<Feedback type="info">` banner at the top of the thread only when present
(`{openingHint && <Feedback ...>}`). Only `freeformChatWithUserStart` sets one ("Ask a question or
name a topic you want to discuss") — `freeformChatWithAIStart` has none, since the AI opens and no
hint is needed.
**Rationale:** Tells the user what's expected of them when they're the one who has to open the
conversation, without forcing every scenario to have one — scenarios where the AI opens, or where
the situation itself makes the first move obvious, can simply omit it.
**Status:** Done.

### Freeform scenarios exported as `freeformScenarios: Scenario[]`; `ChatContainer` owns `selectedScenario`

**Date:** 2026-08-11
**Decision:** `freeformChatWithAIStart`/`freeformChatWithUserStart` (see "Freeform chat modeled as
two explicit `Scenario` objects," 2026-07-30) are no longer individually exported — they become
private consts in `scenarios.ts`, and a new `freeformScenarios: Scenario[] = [freeformChatWithAIStart,
freeformChatWithUserStart]` is exported instead. `Scenario` also gains `initiallySelected?: boolean`
(set on the AI-starts variant). `ChatContainer` now owns `scenario` state, seeded by a new
`getInitialScenario()` that finds the `freeformScenarios` entry with `initiallySelected: true`
(falling back to `freeformScenarios[0]` — "should never happen" per its comment). `ChatSetup`/
`SetupForm` receive `freeformScenarios`/`selectedScenario`/`onChangeScenario` as props; `SetupForm`
no longer holds its own local `starter` state (the `useState<Starter>` + `defaultStarter` import are
removed) — the AI/user `SegmentedControl` now reads `selectedScenario.starter` directly, and its
`onSelect` (`handleSelectFreeformScenario`) looks up the matching scenario in `freeformScenarios` by
`starter` and calls `onChangeScenario`. `getChatConfig` is called with `selectedScenario` on submit,
same as before.
**Rationale:** Lifting scenario selection out of `SetupForm`'s local state and into `ChatContainer`
(alongside `language`/`level`, which already lived there) makes scenario state consistent with the
other setup fields, and having a real array (rather than two named consts referenced directly) means
`getInitialScenario()`/`handleSelectFreeformScenario` can be written generically instead of as an
`if (starter === 'ai') ... else ...` branch.
**Naming is deliberate — `selectedScenario`, not `selectedFreeformScenario`:** anticipates that once
closed scenarios exist (see "Predefined-scenario-picks-its-own-starter setup mode," backlog.md,
postponed 2026-07-30), `ChatContainer`'s selected-scenario state may hold either a freeform or a
closed `Scenario`, picked through different UI (closed scenarios pick their own starter, so
wouldn't go through the `starter`-based `SegmentedControl` lookup `SetupForm` uses today). The prop
is named for what it will need to mean later, not just what it means today. This does not itself
implement closed-scenario selection — no discriminant exists yet between freeform and closed
`Scenario` objects at the type level (same known gap noted in the 2026-07-30 entry).
**Status:** Done.

---

## Stop chat brought back; session-ending moves to a dispatched `END_SESSION` action (2026-08-12)

### `STOP_CHAT` action and a `chatStopped` phase reintroduced, as a two-step stop → end flow

**Date:** 2026-08-12
**Decision:** `chatReducer.ts` gets two new phases and two new actions:

- `chatStopped` — entered from any phase except `chatStartPending`/`chatStopped`/`sessionEnded`
  itself when `STOP_CHAT` is dispatched. Checked at the top of the reducer, before the
  phase-specific switch (same pattern as the original 2026-07-27 `STOP_CHAT` guard).
- `sessionEnded` — entered from any phase except `chatStartPending`/`sessionEnded` itself when
  `END_SESSION` is dispatched, including directly from `chatStopped` (there's no requirement to
  pass through `chatStopped` first — `END_SESSION` short-circuits from anywhere `STOP_CHAT` could
  have fired too).

In `ControlsArea`, a new "Stop chat" secondary button (`canStopChat`) sits alongside the existing
"End session" secondary button (`shouldShowEndSessionButton`, renamed from `shouldShowStopButton`)
whenever neither is excluded — both buttons only differ in what they exclude: `canStopChat` also
requires `!chatHasStopped(phase)`; `shouldShowEndSessionButton` also requires `!hasError(phase)`
(unchanged from before this change). `ControlsArea.module.css` gains a 3-area grid
(`primary`/`secondary`/`tertiary`) via `&:has(:nth-child(3))` to lay out the primary action button
plus both secondary buttons when they're both visible at once, instead of only ever supporting one
secondary button. Once `chatStopped`, both secondary buttons disappear and the primary button
becomes "End this session" (`onEndSessionRequested`, dispatching `END_SESSION`).

**Rationale:** Reintroduces the ability to stop a chat while not mid-input (`userIsInInputFlow`
window excluded, same as the old `STOP_CHAT` gate) as a distinct, reversible-feeling step ahead of
actually ending the session — "Stop chat" pauses the conversation and narrows the UI down to a
single "End this session" action, rather than ending the session immediately the way the old
`STOP_CHAT` → `chatEnded` flow did. For now `chatStopped` only offers ending the session; the plan
is for a future iteration to offer requesting an evaluation from `chatStopped` instead (see
backlog.md).

**Supersedes:** the 2026-08-04 "reply-phase UX redesign" decision to remove `STOP_CHAT` and the
terminal `chatEnded` phase entirely (see "Reply-phase UX redesign implemented," below) — that
removal is reversed by this entry, under new phase names (`chatStopped` instead of the old
`chatEnded`) and a changed two-step shape (stop, then a separate end-session step, instead of one
terminal phase reached directly). status.md's framing of the 2026-08-04 removal ("no cleanup
behavior was actually lost by this") no longer describes current behavior — a `STOP_CHAT`-shaped
action is back, doing more (an intermediate `chatStopped` phase) than the original did.

**Bug fixed during this change, not shipped as originally written:** the first version of
`canStopChat` didn't exclude `hasError(phase)`, so "Stop chat" would have rendered alongside the
primary "End this session" button during an `error` phase too, contradicting
`shouldShowEndSessionButton`'s adjacent code comment ("if phase is error, we could technically stop
the chat, but then we still need to end the session. So we'll just set primary button to End
session") — the comment's stated intent was never applied to the new button. Clicking "Stop chat"
during an `error` phase would also have silently discarded `phase.error` (overwriting it with
`chatStopped`), losing the error message with no way back to it. Caught and fixed before this was
documented as intended behavior: `canStopChat` now also requires `!hasError(phase)`.
**Status:** Superseded 2026-08-14 — see "'Stop chat' superseded by the `ChatStage` refactor" further
down this log. `chatStopped`/`STOP_CHAT`/`canStopChat` no longer exist in the code; ending a session
is a single-step `sessionEndRequested` phase, not a stop-then-end two-step.

### Ending a session is a dispatched `END_SESSION` action again, not a direct `onEndSession()` call from `ControlsArea`

**Date:** 2026-08-12
**Decision:** `ControlsArea` no longer calls `onEndSession` (the prop from `ChatContainer`)
directly. It calls a new `onEndSessionRequested` prop instead, which `ChatConversation` wires to
`handleEndSessionRequest` (`dispatch({ type: 'END_SESSION' })`). A new `useEffect` in
`ChatConversation`, keyed on `sessionShouldEnd(state.phase)` (i.e. `phase.status === 'sessionEnded'`),
calls the real `onEndSession()` prop as a side effect of that phase being reached — from every path
that used to call `onEndSession` directly (the normal "End session" button and the `error`-phase
"End this session" button both now route through `END_SESSION` first).

**Distinct from the pre-2026-07-30 `END_SESSION` action:** that earlier action (see "Error recovery
implemented: dedicated `END_SESSION` action," 2026-07-27) reset the reducer's own state straight
back to `readyForNewChat`/`chatStartPending` in place, without unmounting `ChatConversation`. This
new `END_SESSION` does not reset in place — it transitions to a terminal `sessionEnded` phase whose
effect calls the `onEndSession` prop, which is still owned by `ChatContainer` and still switches the
container back to rendering `ChatSetup`, unmounting `ChatConversation` entirely (the same outcome
the direct call already produced since 2026-07-30). Only the _mechanism_ for reaching that outcome
changed — a dispatched action + effect, instead of a direct prop call from a click handler — not
what happens once it fires.

**Supersedes:** the 2026-07-30 "Setup screen extraction" decision's statement that "ending a
session... is now a direct `onEndSession` prop call from `ChatConversation` to `ChatContainer`, not
a dispatched action" (see "New `ChatContainer`/`ChatSetup` components" and "`chatReducer` scope
narrowed... `END_SESSION` removed," both 2026-07-30) — that mechanism is reversed by this entry.
**Rationale:** Session-ending now needs to participate in reducer state (so `requestsShouldBeAborted`
— see below — can key off it) rather than being a side-channel prop call the reducer has no
visibility into.
**Status:** Superseded 2026-08-14 in its specifics (the phase is now `sessionEndRequested`, not
`sessionEnded`, and it's reached in one step rather than optionally via `chatStopped` first) — see
"'Stop chat' superseded by the `ChatStage` refactor" further down this log. The core mechanism this
entry established (dispatched `END_SESSION` → terminal phase → effect calls `onEndSession`) is
unchanged.

### Pending AI requests are aborted when the chat is stopped or the session ends

**Date:** 2026-08-12
**Decision:** New `useEffect` in `ChatConversation`, keyed on `requestsShouldBeAborted(state.phase)`
(true for both `chatStopped` and `sessionEnded`): increments `requestIdRef.current` and calls
`abortControllerRef.current?.abort()`. `sendMessageToAI`'s existing stale-response guard
(`requestIsStale`, comparing a captured `requestId` against `requestIdRef.current`) already existed
for race-safety around fast phase changes; this reuses that same ref rather than adding a second
mechanism, and the `AbortError` catch branch already present in `sendMessageToAI` (`return` without
dispatching) already handled cancelled fetches silently — no new error-handling branch was needed,
only a new trigger for calling `.abort()` itself.
**Rationale:** Without this, stopping the chat or ending the session mid-request left the in-flight
`sendChatMessage` call running to completion in the background, wasting a request against the
$5/month budget and risking a late `AI_RESPONSE_RECEIVED`/`ERROR` dispatch landing after the user
had already moved on.
**Status:** Still true in shape (`requestsShouldBeAborted` still exists and is still used the same
way — see decisions.md, 2026-08-14 evaluation entry), but now keyed only on `sessionEndRequested`
since `chatStopped` no longer exists.

### Dead code removed: unused `shouldShowStopChatButton`

**Date:** 2026-08-12
**Decision:** A `shouldShowStopChatButton` helper was added to `chatReducer.ts` alongside `canStopChat`
during this change but never imported anywhere — `ControlsArea` uses `canStopChat` (different
logic: also excludes `chatStopped` and, after the fix above, `error`). Removed as unused rather than
kept or documented as a known gap.
**Status:** Done (moot as of 2026-08-14 — `canStopChat` itself no longer exists either).

### "Start conversation" button relabeled to "Start chat"

**Date:** 2026-08-12
**Decision:** `SetupForm`'s submit button text changes from "Start conversation" to "Start chat".
**Rationale:** Matches the "Stop chat"/`ChatConversation` naming introduced by this same change —
not itself a functional change.
**Status:** Done.

## `ControlsArea` button config refactor (2026-08-14)

### Buttons derived from a `ChatStage`, keyed by priority

**Date:** 2026-08-14
**Decision:** Replace `ControlsArea`'s per-button `shouldShowXButton`/`canX` functions and the
`getPrimaryButtonProps` if-chain with:

- `ChatStage` (`'aiTurnFlow' | 'userTurnFlow' | 'evaluation' | 'error' | 'sessionEnded'`) and
  `getChatStage(phase): ChatStage` — an exhaustive switch over `phase.status`, defined in
  `chatReducer.ts` alongside the reducer's own switch (a `never`-typed default enforces every new
  phase gets bucketed into a stage).
- `buttonsByStage: Record<ChatStage, Partial<Record<ButtonPriority, ButtonId>>>` — which buttons
  appear in a stage and in what priority slot (`primary | secondary | tertiary`):
  `aiTurnFlow: { primary: 'speak', secondary: 'evaluate', tertiary: 'endSession' }`,
  `userTurnFlow: { primary: 'send', secondary: 'cancel' }`, `evaluation: { primary: 'endSession'
  }`, `error: { primary: 'endSession' }`, `sessionEnded: {}`.
- `buttonConfig: Record<ButtonId, { label, onClick }>` — static label/handler per button,
  independent of phase/stage (`ButtonId` = `'speak' | 'send' | 'cancel' | 'evaluate' |
  'endSession'`).
- `buttonIsDisabled(buttonId, phase)` — the only place per-status logic remains: `speak` disabled
  unless `canSpeak(phase)`, `send` unless `canRequestSend(phase)`, `cancel` unless
  `canRequestCancel(phase)`, `evaluate` unless `canRequestEvaluation(phase)`; `endSession` is never
  disabled.
- `ControlsArea` renders by mapping `priorityOrder` (`['primary', 'secondary', 'tertiary']`) against
  `buttonsByStage[stage]`, looking up each button's label/handler in `buttonConfig`, skipping empty
  slots. A `getLabel` override still special-cases the `speak` button's text to "Start conversation"
  when `isReadyForUserStart(phase)` (vs. "Reply" otherwise) — the one piece of copy that depends on
  phase, not just stage.

`ControlsArea.module.css` gains named grid areas (`primary`/`secondary`/`tertiary`) instead of a
plain two-column grid, so a stage can show one, two, or three buttons without a bespoke layout per
count — `&:has(:nth-child(3))` switches to a 3-area layout (primary spanning the top row, secondary
+ tertiary below) only when a third button is actually present.

**Rationale:** The prior code tangled two concerns — visibility (which buttons show in which phase)
and per-button enable/disable logic — inside one `if`-chain (`getPrimaryButtonProps`) plus several
one-off `shouldShowXButton` booleans, each independently re-deriving "what phase am I in" via ad hoc
groupings of `phase.status` values (e.g. the old `userIsInInputFlow` helper). Adding the evaluation
feature's own button in that shape would have meant another `shouldShowEvaluateButton` boolean and
another primary-button branch, growing the same tangle rather than fitting a pattern. Introducing
`ChatStage` as an explicit, named grouping — with an exhaustive switch enforcing every phase maps to
exactly one stage — turns "which buttons show" into a single lookup table (`buttonsByStage`) instead
of scattered conditionals, and separates it cleanly from "is this specific button clickable right
now" (`buttonIsDisabled`), which still needs the finer-grained phase checks. `userIsInInputFlow` is
now expressed as `getChatStage(phase) === 'userTurnFlow'`, kept as a thin wrapper since
`SpeechToText.tsx`/elsewhere still call it by that name.
**Status:** Done. Landed via branch `add-phase-stages` (commits `c02bfbd`, `c2e7837`, `a1766ff`,
`fe90035`, merged `aa74377`), the same round of work that reworked "Stop chat" — see "'Stop chat'
superseded by the `ChatStage` refactor" below for how that interacts with this entry.

### "Stop chat" superseded by the `ChatStage` refactor; single-step session end

**Date:** 2026-08-14
**Decision:** The `chatStopped` phase, the `STOP_CHAT` action, and the "Stop chat" secondary button
— all added 2026-08-12, see "Stop chat brought back..." below — are removed again, two days later, as
part of the same `ChatStage` refactor described above. Ending a session is now a single step: `END_SESSION`
transitions directly to a new `sessionEndRequested` phase (checked at the top of the reducer,
unconditionally — no phase is excluded, unlike the old `STOP_CHAT` guard) whose `ChatStage` is
`sessionEnded`, showing zero buttons. A `ChatConversation` effect keyed on `sessionShouldEnd(phase)`
(`phase.status === 'sessionEndRequested'`) still calls the `onEndSession` prop, same as the
2026-08-12 `sessionEnded`-phase effect did. `requestsShouldBeAborted` still aborts in-flight AI
requests, now keyed on `sessionEndRequested` alone (the commented-out `requestEvaluation` line in
that function is leftover scaffolding, not active).
**Rationale:** Not a documented, deliberate reversal — the two-step stop-then-end shape and the
"Stop chat" button were dropped as a side effect of building the `ChatStage` abstraction and the
evaluation feature's own secondary button in the same pass, rather than a re-litigated decision
against the 2026-08-12 rationale. `aiTurnFlow`'s secondary/tertiary slots ended up going to
`evaluate`/`endSession` instead of `stopChat`/`endSession` — there was no design conversation
captured about dropping "Stop chat" specifically, just that it didn't reappear once the button set
was rebuilt around stages. Flagged here explicitly because status.md and the 2026-08-12 entries below
describe "Stop chat" as current, shipped behavior, which it no longer is as of this refactor — worth
confirming with the project owner whether "Stop chat" was intentionally dropped or should be added
back into `buttonsByStage.aiTurnFlow` alongside `evaluate`.
**Consequence:** The `chatStopped`-shaped landing spot backlog.md described for a future "request
evaluation from here" option (see the 2026-08-12 entries and backlog.md, "Add evaluation") no longer
exists — evaluation instead got its own always-available secondary button in `aiTurnFlow`, which
supersedes that plan more directly than originally scoped, but wasn't a deliberate choice between the
two designs.
**Status:** Done (i.e., this is what's actually in the tree) — but see Rationale: the "why" behind
dropping "Stop chat" itself is not established, only the mechanical outcome.

---

## Evaluation: first working implementation (2026-08-13–2026-08-14)

### Reducer/UI shape: `requestEvaluation` → `waitingForEvaluation` → `evaluation`, own secondary button

**Date:** 2026-08-13–2026-08-14
**Decision:** Three new phases and three new actions in `chatReducer.ts`:

- `REQUEST_EVALUATION` — checked at the top of the reducer (alongside `ERROR`/`END_SESSION`), guarded
  by `canRequestEvaluation(phase)` (`aiTurnSpeaking` or `readyForUserReply` only); any phase → `{
  status: 'requestEvaluation' }`.
- `EVALUATION_REQUEST_SENT` — `requestEvaluation` → `waitingForEvaluation`.
- `EVALUATION_RECEIVED; payload: { evaluation }` — `waitingForEvaluation` → `evaluation` (terminal:
  the `evaluation` case returns `state` unconditionally, same pattern as `sessionEndRequested`),
  appending a new `EvaluationItem` (`{ type: 'evaluation'; message }`) to `threadItems`.

`ThreadItem` is now a union (`ChatMessageItem | EvaluationItem`) instead of a single shape — existing
chat messages gained an explicit `type: 'message'` discriminant so `ThreadView` can branch on
`item.type` to render either a `SpeechBalloon` or the new `Evaluation` component.

`ChatConversation` drives the request the same way it drives a normal AI turn: a `useEffect` keyed on
`shouldRequestEvaluation(state.phase)` calls `sendEvaluationRequest()`, which dispatches
`EVALUATION_REQUEST_SENT` then awaits `sendEvaluationRequestToAI()`. Both this and the normal chat
send path (`sendMessageToAI`) were refactored to share a new `sendToAI(input, systemInstruction,
aiRole)` helper — the abort-controller/stale-request-guard/error-dispatch plumbing that used to live
only in `sendMessageToAI` is now shared, differing only in which `AIError`-shaped result triggers
which dispatch afterward (`AI_RESPONSE_RECEIVED` vs. `EVALUATION_RECEIVED`).

`ControlsArea` gets an "Evaluate" button (`buttonsByStage.aiTurnFlow.secondary`, disabled unless
`canRequestEvaluation(phase)`) — see the `ChatStage` refactor entry above. It's available any time
the AI has just replied or is mid-reply-turn, not gated behind ending or stopping the chat first.
**Rationale:** Reuses the exact same request/dispatch/abort machinery already proven for chat turns,
rather than a parallel one-off implementation — the two flows (`sendMessageToAI`/
`sendEvaluationRequestToAI`) are now thin wrappers around the shared `sendToAI`. Putting "Evaluate" in
the normal turn controls (rather than behind a stop/end step, as backlog.md originally anticipated —
see "Add evaluation" there) lets a user request feedback at any natural pause without first
committing to ending the session.
**Status:** Done, mock-backed only so far (`NEXT_PUBLIC_USE_MOCK_AI=true`) — real-Gemini evaluation
calls go through the same generalized `/api/ai` route as chat (see "Real AI route generalized" below)
and haven't been separately verified live yet.

### Evaluation continues the same interaction via `previousInteractionId`, not a fresh transcript replay

**Date:** 2026-08-13–2026-08-14
**Decision:** `sendEvaluationRequestToAI` calls `sendToAI` with the same `previousInteractionId`
component state the chat turns already maintain — the evaluation request is sent as a continuation of
the ongoing Gemini interaction, not as a new interaction seeded with the full transcript serialized
into the input text.
**Rationale:** Directly reuses Spike 3's finding (2026-07-25, see above): conversation context
carries over via `previous_interaction_id` without needing to resend prior turns, but
`system_instruction` does not and must be sent on every call. `evaluationConfig.ts`'s
`getEvaluationSystemInstruction` is written accordingly — it re-establishes the evaluator persona
from scratch (native-speaker teacher, not the in-scenario chat partner) rather than assuming any
framing carries over, while `getEvaluationInput` only says "go through the history of this chat" —
relying on the already-carried-over interaction history to supply that content, not re-sending it.
**Known risk, not yet verified:** this assumes Gemini's stored interaction history is sufficient
context for the model to actually re-read and evaluate the user's own turns specifically (as opposed
to the conversation's content generally) when prompted only with a new system instruction + a short
"give feedback" input. Not confirmed against the real API yet (see "Status" above) — could turn out
to need the transcript passed explicitly after all.

### Evaluation output is plain text, not structured/fielded JSON

**Date:** 2026-08-13–2026-08-14
**Decision:** `getEvaluationSystemInstruction`'s only output-format rule is "The reply should be
plain text only." `getEvaluationInput` asks for one terse, unstructured pass over the user's turns —
no separate grammar/vocabulary/nuance fields, no JSON schema. `Evaluation.tsx` renders the whole
string as-is inside a single block.
**Rationale/status — not a closed decision, just what got built first:** requirements.md's MVP scope
still describes "async structured evaluation: grammar, vocabulary upgrades, semantic nuance" and
lists "exact fields/depth of the structured evaluation output" as open. This first pass ships the
simplest version that exercises the whole pipeline (request → AI call → render) end-to-end, deferring
the structured-fields question rather than answering it. Worth flagging explicitly since it's easy to
read the feature as "evaluation: done" from status.md's "What exists" — the plumbing is done, the
actual MVP-scoped output shape is not.
**Status:** Requirements.md's "exact fields/depth" item remains open — this entry doesn't resolve it,
it just records that the first implementation sidesteps it. **Update 2026-08-14:** confirmed as
temporary, not a settled shape — structured output is now the declared next task (see status.md,
"Next step," and backlog.md), ahead of any other project work. No schema or validation-library
decision has been made yet; log it here once it is.

### Known gaps in this first pass

**Date:** 2026-08-14
- **No loading indicator while `waitingForEvaluation`:** `ThreadView`'s pending-AI-balloon effect is
  keyed on `isWaitingForAI(phase)` only (the chat-turn wait), not the new `waitingForEvaluation`
  phase — requesting an evaluation currently gives no visual feedback until the result appears (all
  three `aiTurnFlow` buttons stay in their disabled/enabled states with nothing indicating a request
  is in flight).
- **`Evaluation.module.css` is missing the `.evaluationContent` class** `Evaluation.tsx` applies to
  its content `<div>` — only `.evaluation` (the outer wrapper) is defined, so the inner div currently
  renders with `className={undefined}` and no wrapper-specific styling.
- **Dead commented-out code left in `ChatConversation.tsx`:** a full `sendMessageToAI_OLD` function
  (the pre-`sendToAI`-extraction implementation) is commented out below the live code, not deleted.
**Status:** Open — none of these block the feature working, but none are fixed either; tracked here
rather than only in status.md/backlog.md since they're artifacts of this specific implementation
pass, not independently-scoped gaps.

---

## Real AI route generalized; mock routes stay split per role (2026-08-13–2026-08-14)

### `/api/ai/chat` → `/api/ai`, shared by both chat and evaluation calls

**Date:** 2026-08-14
**Decision:** The real Gemini route moves from `src/app/api/ai/chat/route.ts` to
`src/app/api/ai/route.ts` — one generic endpoint, not one per AI "role". `ChatMessageParams` (the
route's local request-body type) is extracted into a shared `src/lib/aiRequest.ts` as
`AIRequestParams`, imported by both the route and `aiService.ts`. In `aiService.ts`,
`sendChatMessage` is renamed `sendAIRequest(params, aiRole: AIRole)` (`AIRole = 'chat' |
'evaluation'`) and `AIChatResult` is renamed `AIResult` — but `aiRole` only ever affects which
_mock_ endpoint is used (`CHAT_ENDPOINT` vs. `EVALUATION_ENDPOINT`); both constants resolve to the
same `/api/ai` when not mocking, and the real route itself has no notion of "role" at all — it just
takes `systemInstruction`/`input`/`previousInteractionId` and calls `interactions.create`, same as
before the rename.
**Rationale:** Chat and evaluation calls are structurally identical requests against Gemini (same
shape, same endpoint, same auth) — differentiated entirely by which `systemInstruction`/`input` the
caller sends, not by anything the route needs to branch on. Introducing a second real route (e.g.
`/api/ai/evaluation`) would duplicate the entire handler for no behavioral difference. Moving the
folder out of `chat/` and dropping the `chat` segment reflects that this was never really a
chat-specific route, just named for its first caller.
**Status:** Done.

### Mock routes stay split: `/api/aiMock/chat` and `/api/aiMock/evaluation`, sharing `respondAfterDelay`

**Date:** 2026-08-13–2026-08-14
**Decision:** Unlike the real route, the mock side keeps two separate route files — a new
`src/app/api/aiMock/evaluation/route.ts` alongside the existing `src/app/api/aiMock/chat/route.ts` —
each with its own hardcoded `scenario`/`MOCK_SCENARIOS` const and its own canned success text. The
shared `respondAfterDelay` helper (delay + `NextResponse.json`) is extracted out of the chat mock
route into `src/app/api/aiMock/respondAfterDelay.ts` so both mock routes import the same
implementation instead of duplicating it.
**Rationale:** The real route can stay unified because Gemini itself doesn't care about "role" — but
the mock exists specifically to let dev flip between success/error/slow-response scenarios by hand
(editing the `scenario` const), and a chat-flow bug and an evaluation-flow bug are independent things
to want to test in isolation; one shared mock scenario switch would force testing both flows through
whatever state the other one happened to be left in. Splitting the routes lets `NEXT_PUBLIC_USE_MOCK_AI`
dev sessions exercise "evaluation succeeds, chat fails" (or vice versa) simultaneously.
**Status:** Done.

### Mock error trigger: sending `input === 'error'` forces the mock's error scenario

**Date:** 2026-08-13
**Decision:** Both mock routes now check `input === 'error'` on the incoming request body — if true,
they respond with the `notFoundError` (404) scenario regardless of the hardcoded `scenario` const,
instead of whatever `scenario` is currently set to.
**Rationale:** Previously, testing error-state UI required editing the `scenario` const by hand and
restarting/reloading — awkward mid-session, and easy to forget to flip back. Sending the literal word
"error" as the spoken/typed input (via `MockSTT`'s dev textarea, or by speaking the word) is a
same-session way to trigger the error path on demand without touching code, while `scenario` still
controls the _default_ (non-error) behavior for normal dev flow.
**Status:** Done.
