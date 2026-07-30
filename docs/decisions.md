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
in backlog.md, not designed here.

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
deliberately deferred" decision (2026-07-22).

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
