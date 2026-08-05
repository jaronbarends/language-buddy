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
"Reply-phase UX redesign implemented"). This rule now describes the intended shape of a *normal*
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