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
