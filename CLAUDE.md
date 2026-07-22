@AGENTS.md

## AI used in this project

- claude.ai: Peer developer discussions: architecture, code, UX/interaction design, and writing prompts for Claude Code.
- Claude Code: implementation, through extension for Cursor or VSCode

## The project

Building "the Conversational Sparring Partner" — a low-stakes web app for higher-B1/lower-B2 language learners (starting with my own case: Norwegian) to practice real-world conversational scenarios (e.g. calling a landlord) against an AI persona, followed by an async structured evaluation (grammar, vocabulary upgrades, semantic nuance) after the session ends.

Scope decision already made: this is a scenario library from the start, not a single hardcoded scenario. Preparing/prompting the LLM to hold a persona across a scenario is itself a deliberate learning goal, not incidental.

## Why this project (for context, don't re-litigate)

Chosen over several alternatives (language-drill dashboards, dev-tooling dashboards, a job-application tracker) specifically because I have a genuine personal need for it — I'm learning Norwegian myself — which should read as authentic rather than manufactured in a case study.

## Stack and why (justify, don't assume)

- Next.js App Router: Route Handlers proxy the LLM so the API key never reaches the client. Confirm any other Next.js feature choice is driven by an actual product need, not "wanted to learn it."
- TypeScript: strict schemas for conversation state and the structured evaluation payload. Note: TS types don't validate untrusted LLM JSON at runtime — a runtime validator (e.g. Zod) is a separate, necessary decision, not redundant with the types.
- AI backend: **Gemini** (paid tier), decided. Gemini's free tier was abandoned after the account dashboard showed a 20 requests/day (RPD) cap — too restrictive for normal development, not just edge-case bursts. Monthly AI API spend is capped at $5 (across dev, spikes, and MVP usage), enforced via a Google AI Studio Project Spend Cap. Spike 1 (2026-07-21) tested scenario/persona coherence in Norwegian on Gemini and held cleanly through 10 turns with no drift — judged good enough to proceed. The planned OpenAI (GPT-4o-mini) comparison spike was deliberately skipped rather than spend further to confirm an already-satisfactory result. Claude was considered and ruled out for this project specifically due to ~10x the token cost of Gemini/OpenAI's cheap-tier models, with no other stated reason to prefer it.

## Known weak spots to own explicitly, not hide

- LLM-based language evaluation is inherently fuzzy/inconsistent — name this as a known limitation in the eventual case study rather than presenting the evaluator as authoritative.
- Current framework depth is thin (proxy + pages). Candidates to deliberately add real justification-driven depth, to revisit once MVP scope is set, not decide now: streaming responses (Route Handlers + Suspense), static/dynamic rendering split (static scenario library vs dynamic session pages, ISR), middleware (quota protection, relevant now for paid-tier budget/rate-limit protection rather than free-tier reliability specifically).

## Primary goal for this project cycle

Demonstrate professional workflow to NL recruiters during my job-market re-entry: stack choices justified by actual problem shape, meaningful git history, some testing, CI, accessibility considered from the start, and a case-study write-up including how AI was used in the build. Weight this more heavily than raw portfolio polish, though this project should score reasonably on both axes given the personal motivation behind it.

## Define done

Before starting any piece of work (a phase, a feature, a spike), make sure explicit, checkable done criteria are defined first. If I haven't done this, prompt me before proceeding.

## Working agreement

This file defines how we work together on this project.
Read this before every session, along with the other files in docs/.

---

## Before you start any session

1. Read `docs/decisions.md` — what has been decided and why
2. Read `docs/requirements.md` — frozen MVP scope, do not modify
3. Read `docs/status.md` — current state and what to do next
4. Read `docs/backlog.md` — prioritized post-MVP features
5. Do not start implementing until you understand the current state

## Doc workflow

- `requirements.md` — frozen MVP scope, do not modify
- `backlog.md` — prioritized post-MVP features; pick next item from here
- `status.md` — update when phase changes or a feature ships
- `decisions.md` — log non-obvious decisions when a feature ships

Flow: backlog.md → status.md (in progress) → decisions.md (if needed)

## Updating docs

When asked to "update the docs" after completing a feature:

1. `status.md` — update current phase and next step
2. `decisions.md` — log any non-obvious decisions made during implementation
3. `backlog.md` — mark the feature as done

Do not modify `requirements.md` unless explicitly asked.

---

## After every session

Update `docs/status.md`:

- What was completed
- What's still in progress or broken
- Any new open questions or decisions that need to be made
- What the next step is

---

## Project structure

- `docs/backlog.md` — future features and ideas
- `docs/decisions.md` — architecture and interaction design decisions
- `docs/requirements.md` — MVP scope and explicit out-of-scope items
- `docs/status.md` — current state, updated every session
- `CLAUDE.md` — this file

---

## React guidelines

- The project uses React 19.

### Generic React guidelines

- Use Suspense for async operations
- Optimize for performance and Web Vitals

### Component architecture

- When writing React components, always place its return statement as early as possible in the component body, and define any internal functions after the return statement (hoisted function declarations), rather than before it.
- Structure components logically: keep exports, subcomponents, helpers, and types well-organized. Extract subcomponents when JSX is complex, reused, or has its own behavior; keep simple, one-off JSX inline for readability. When a subcomponent is only used once, keep it in the same file.

### importing

- Use absolute paths for imports with the `@/` prefix, unless you are importing a CSS module with the same base name as the current file from the same directory (use `./` then). e.g. in `@/app/components/someFeature/SomeComponent.jsx`:
  - ✅ `import AnotherComponent from '@/app/components/someFeature/AnotherComponent'`
  - ❌ `import AnotherComponent from './AnotherComponent'`
  - ✅ `import YetAnotherComponent from '@/app/components/YetAnotherComponent'`
  - ❌ `import YetAnotherComponent from '../YetAnotherComponent'`
  - ✅ `import styles from './SomeComponent.module.css'` (CSS module matching current file)
  - ❌ `import styles from '@/app/components/someFeature/SomeComponent.module.css'`
  - ✅ `import styles from '@/app/components/someFeature/AnotherComponent.module.css'` (different file's CSS module)
  - ❌ `import styles from './AnotherComponent.module.css'`
  - Note: `@/` requires bundler config (automatic in Next.js; manual in Vite via `resolve.alias`)

## TypeScript Usage

- Use TypeScript for all code
- Avoid enums; use const maps instead
- Implement proper type safety and inference
- Use `satisfies` operator for type validation

## Next.js guidelines

- The project uses Next.js 15 with App Router
- Favor React Server Components (RSC) where possible
- Minimize `use client` directives

### State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage enhanced `useFormStatus` with new properties (data, method, action)
- Implement URL state management with 'nuqs'
- Minimize client-side state

## CSS guidelines

- Do not use Tailwind css
- Organize css in separate files
- When using React, use CSS modules
- Use class selectors over ID selectors for styling.
- Use Flexbox and Grid for layout.
- Use CSS variables for consistent theming.

#### units

- prefer rems (based on root size of 16px) over px

### Design tokens

CSS tokens form a closed scale. Never add new token values.
If a needed value doesn't exist, stop and ask which existing token to use instead.
