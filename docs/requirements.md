# Requirements

## MVP scope

### Core features

- [ ] Scenario library (multiple scenarios; not a single hardcoded one from the start)
- [ ] Scenario opening line delivered by AI persona (generic friendly acquaintance — not a specific character)
- [ ] Speech-to-text input (hard MVP requirement)
- [ ] Text-to-speech output (AI speaking its responses) — moved into MVP scope after spike 2 (see decisions.md)
- [ ] Multi-turn conversation loop against AI persona, in-scenario
- [ ] Session ends via max-turn limit or explicit user action ("End conversation")
- [ ] Async structured evaluation after session ends: grammar, vocabulary upgrades, semantic nuance
- [ ] Session state is in-memory only for MVP — no persistence across refresh/tab close/return visits

### Explicitly deferred (tracked, not MVP)

- [ ] STT transcript review/edit step before sending to AI — spike 2 showed STT accuracy is good
  enough that this is not needed (see decisions.md)

### Open — pending spike results or further scoping

- [ ] AI provider: Gemini vs OpenAI — Spike 1 will be run against both for comparison before this
  is decided (see decisions.md, 2026-07-20)
- [ ] Max number of turns per session (depends on Spike 1 scenario-coherence results)
- [ ] Number of scenarios shipping at v1 launch
- [ ] Whether MVP has any auth/user concept at all
- [ ] Exact fields/depth of the structured evaluation output

### Pages (MVP)

- Not yet decided — pending scope completion

### Not in MVP

- Persistence (session/evaluation survive refresh or return visit)
- Rich/specific AI personas (generic friendly acquaintance only)

---

## Known limitations (own explicitly, not hide)

- LLM-based language evaluation is inherently fuzzy/inconsistent. This is a known limitation to
  state plainly in the eventual case study, not something the evaluator's output should imply is
  authoritative.
- AI API cost is capped at $5/month by design (see decisions.md). At this project's scale this is
  not expected to be a binding constraint — token-level cost modeling puts a full conversation at a
  small fraction of a cent for the candidate providers — but it is a deliberate ceiling, not an
  unlimited budget, and should be named as such in the case study.
- Free-tier usage was ruled out for both dev and MVP after discovering Gemini's free-tier daily
  request cap (20 RPD on the account used) is too restrictive for normal development, not just
  edge-case bursts. The app runs on a paid tier with a hard monthly spend cap instead.
