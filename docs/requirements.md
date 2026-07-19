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

- [ ] Max number of turns per session (depends on Gemini free-tier coherence spike)
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
- Google AI Studio / Gemini free tier has real reliability constraints (rate limits, cold starts)
  that must be designed around, not treated as edge cases.
