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
- [ ] Setup screen before the conversation loop: pick language (from a limited, config-driven list)
      and who starts (user or AI); "Start conversation" lives here, not in the conversation
      component. v0 scope is "open chat" only — two explicit `Scenario` objects (user-starts /
      AI-starts), not a scenario-array selector (see decisions.md, 2026-07-30)

#### v0 interaction/state model

- [ ] 9-state model implemented via useReducer + discriminated union (see decisions.md,
      2026-07-22 through 2026-07-27, for full state list and transitions — the original
      2026-07-22/07-23 model has since dropped `sending` and `initializing`). **Real STT wiring
      (2026-07-28) adds two further phases, `listeningStopped` and `readyForSendingUserReply` —
      see decisions.md.** **2026-07-30: `readyForNewChat` → `chatStartPending` and `ended` →
      `chatEnded`; the `END_SESSION` action is removed — ending a session is a direct component
      call, not a reducer action (see decisions.md).**
- [ ] Error/retry, end-conversation-from-anywhere, and listening-timeout behaviors implemented per
      decisions.md
- [ ] Hidden AI-opening instruction excluded from transcript and from future evaluation input

### Explicitly deferred (tracked, not MVP)

- [ ] STT transcript review/edit step before sending to AI — spike 2 showed STT accuracy is good
      enough that this is not needed (see decisions.md). **Addendum 2026-07-28:** transcript will
      be displayed read-only before send as STT is wired in — still no edit/review capability;
      see decisions.md.
- [ ] Predefined-scenario-picks-its-own-starter setup mode ("mode 2") — the setup screen (see Core
      features above) builds only the open-chat case for v0; a scenario that dictates its own
      starter, selected from the growing `scenarios` array, is deferred (see decisions.md,
      2026-07-30, and backlog.md).

### Resolved

- [x] AI provider: **Gemini** (paid tier). Spike 1 held cleanly through 10 turns with no drift;
      the planned OpenAI comparison spike was deliberately skipped rather than spend further to confirm
      an already-satisfactory result (see decisions.md, 2026-07-21).
- [x] Max number of turns per session: no fixed number from Spike 1 — no drift/breaking point
      appeared within the 10 turns tested, so this will be tuned during build rather than derived from
      a spike ceiling (see decisions.md, 2026-07-21).
- [x] Auth: none for MVP (see decisions.md, 2026-07-22).
- [x] v0 scenario scope: one hardcoded scenario for the first build; scenario library remains the
      eventual target, generalized after v0 (see decisions.md, 2026-07-22).
- [x] Evaluation feasibility: no spike needed — judged well-established LLM capability, not a
      behavioral unknown like Spike 1/2 (see decisions.md, 2026-07-22).
- [x] Setup screen shape: language + starter selection, open-chat-only for v0, modeled as two
      explicit `Scenario` objects rather than a new parameter or a `scenarios`-array selector (see
      decisions.md, 2026-07-30).

### Open — pending further scoping

- [ ] Exact fields/depth of the structured evaluation output
- [ ] Number of scenarios shipping at v1 launch (post-v0 decision, not a v0 blocker)

### Pages (MVP)

- Not yet decided — pending scope completion

### Not in MVP

- Persistence (session/evaluation survive refresh or return visit)
- Rich/specific AI personas (generic friendly acquaintance only)
- Predefined-scenario-picks-its-own-starter setup mode (see "Explicitly deferred" above)

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
