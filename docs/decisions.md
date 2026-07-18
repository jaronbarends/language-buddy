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

---

## Architecture candidates (not yet decided)

Flagged for revisit once MVP scope is fully set — not decided now:

- Streaming responses (Route Handlers + Suspense)
- Static/dynamic rendering split (static scenario library vs. dynamic session pages, ISR)
- Middleware for free-tier quota protection

---

## Spikes (planned, not yet run)

### Spike 1: Gemini free-tier scenario coherence

**Question:** Can Gemini free tier hold a lightweight scenario (situation + goal, no rich persona)
coherently across ~5–10 turns without drifting or breaking character, in Norwegian?
**Why it matters:** Directly determines the MVP max-turns limit — this isn't a UX choice until the
technical ceiling is known.

### Spike 2: Browser STT accuracy for Norwegian learner speech

**Question:** How well does the Web Speech API transcribe Norwegian B1/B2 learner speech — accurate
enough to send straight to the LLM, or rough enough that the deferred review step becomes an MVP
requirement immediately?
**Why it matters:** Determines whether the STT review step (currently deferred) needs to move into
MVP scope.
