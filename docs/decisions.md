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
