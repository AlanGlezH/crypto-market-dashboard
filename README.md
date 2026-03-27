# Crypto Market Dashboard

Top-20 crypto markets by USD market cap: sortable table, search, and a detail drawer (summary, 7-day chart, description) backed by the [CoinGecko](https://www.coingecko.com/) public API.

**Specs:** [REQUIREMENTS.md](./REQUIREMENTS.md) · **Architecture:** [DESIGN.md](./DESIGN.md) · **Build plan:** [PLAN.md](./PLAN.md) · **Code style:** [CODING_STANDARDS.md](./CODING_STANDARDS.md) · **UI reference:** [docs/design/](./docs/design/)

## Prerequisites

- **Node.js** 20+ (or current LTS)

## Setup

```bash
npm install
```

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Production build (`tsc` + Vite) |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest once (CI / pre-commit) |
| `npm run test:watch` | Vitest watch mode |
| `npm run lint` | ESLint |

Git **pre-commit** (Husky) runs **lint-staged** (ESLint on staged TS/TSX), **`npm test`**, and **`npm run build`**.

## API note

CoinGecko applies **rate limits** (e.g. HTTP 429). The app surfaces a dedicated message and **Retry** for the markets list; detail/chart errors show inline retry where applicable.

## Technical choices (short)

- **React 19** + **TypeScript** + **Vite** for a fast, typed UI.
- **TanStack Query** for server state, caching, and retries (rate-limit aware per [DESIGN.md](./DESIGN.md)).
- **Tailwind CSS v4** for layout and styling; **Recharts** for the sparkline and 7-day price chart.
- **Vitest** and **Testing Library** for behavior-focused tests (requirements and regressions, not implementation trivia).
- **Folder layout** stays **by-type** (`components/table`, `hooks`, `utils`, …) per [DESIGN.md](./DESIGN.md) §2 and **NFR-DES-3**; a **by-feature** split is optional later if the tree grows painful.

## Verification

Cross-check acceptance criteria in [REQUIREMENTS.md](./REQUIREMENTS.md); automated tests cover the main flows (markets load, errors + retry, sort, search empty state, drawer from URL, a11y-oriented drawer tests, description toggle, etc.). Run **`npm test`** before merge.

## AI usage

AI assistants (e.g. Cursor) were used for implementation speed, refactors, tests, and tooling (ESLint, Husky, docs). Human review and project docs ([REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md), [CODING_STANDARDS.md](./CODING_STANDARDS.md)) set scope and conventions; automated checks (`npm test`, `npm run lint`, `npm run build`) validate changes before commit.
