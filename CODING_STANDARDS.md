# Coding standards

These guidelines apply to all code in this repository. For product behavior and architecture, see `REQUIREMENTS.md` and `DESIGN.md`.

## Principles

- **Clarity over cleverness.** Prefer straightforward control flow and names that explain intent.
- **Minimal impact.** Change only what is needed for the task; avoid drive-by refactors and unrelated formatting churn.
- **Small, focused units.** Prefer short functions and components with a single responsibility. If a function does several distinct things, split it.
- **DRY when it pays off.** Remove duplication when the repeated logic is stable and a shared helper would stay obvious. Do not abstract one-off similarity or unstable code paths.

## Self-documenting code

- Rely on **clear names**, **types**, and **structure** so readers understand *what* the code does without scanning comments.
- Use **early returns** and small helpers instead of deep nesting.
- **Avoid nested ternary operators** (`a ? b : c ? d : e`). Prefer **`if` / `else`** and **well-named intermediate variables** so branching is easy to read and change.
- Prefer **TypeScript types** to encode contracts; avoid `any` unless there is a documented exception.

## Comments and JSDoc

- **Comments** are for **why**, non-obvious **constraints**, **edge cases**, and integration notes (e.g. API quirks). Avoid restating what the code already says.
- **JSDoc** (`/** ... */`) where it **adds real value**, especially:
  - **Exported** functions, hooks, and types used outside the file
  - Non-obvious parameters, return semantics, or invariants
  - Public-facing or cross-module contracts
- **Skip** redundant JSDoc on private helpers when the name and signature are sufficient.

## React and UI

- Keep components **presentational vs logic** separated when it improves readability (hooks and small components over huge JSX blocks).
- **Do not define `function renderX()` / helpers inside a component that only return JSX.** That pattern looks like a nameless inner component: it **recreates the function every render**, obscures **props and data flow**, and makes **`React.memo` / `useCallback` boundaries** harder to reason about. Prefer a **named child component in the same file** (or its own module) with an explicit **props type** and use `<Child ... />` from the parent. Hooks stay in the parent (or in the child if that subtree owns the state). **Exception:** trivial **non-JSX** helpers (formatting, small pure logic) or one-liners that are **not** a distinct UI subtree—those need not become components.
- **No inline handler lambdas in JSX** (e.g. `onClick={() => setX(1)}`). Define a **named function** in the component (or module) and pass `onClick={handleClick}`. Use **`useCallback`** only when a stable reference is required (e.g. memoized children, effect dependencies).
- Match **existing patterns** in the codebase for hooks, data fetching, and styling unless a change is part of the task.
- For **performance** (async waterfalls, bundle size, re-renders, etc.), treat [Vercel’s React Best Practices](https://vercel.com/blog/introducing-react-best-practices) and the [`react-best-practices` skill](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) as supplementary reference—not a replacement for this document.

## Testing and quality

- **Tests** should cover behavior that matters for requirements and regressions; follow patterns in existing `*.test.tsx` files.
- Before considering work complete when behavior or types change, run **`npm run lint`** and **`npm test`**.

## AI assistants

- Follow this document when generating or editing code in this repo.
- For Cursor, align project rules in `.cursor/rules/` with this file when present.
- For Claude Code and similar tools, use `CLAUDE.md` at the repo root if present to point at this file and the requirement/design docs.
