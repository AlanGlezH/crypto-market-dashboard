# Crypto Market Dashboard

Top-20 crypto markets by USD market cap: sortable table, search, and a detail drawer (summary, 7-day chart, description) backed by the [CoinGecko](https://www.coingecko.com/) public API.

**Specs:** [REQUIREMENTS.md](./docs/REQUIREMENTS.md) · **Architecture:** [DESIGN.md](./docs/DESIGN.md) · **Build plan:** [PLAN.md](./docs/PLAN.md) · **Code style:** [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) · **UI reference:** [docs/design/](./docs/design/)

## Prerequisites

- **Node.js** 20+ (or current LTS)

## Setup

```bash
npm install
```

## Scripts


| Command              | Purpose                           |
| -------------------- | --------------------------------- |
| `npm run dev`        | Dev server (Vite)                 |
| `npm run build`      | Production build (`tsc` + Vite)   |
| `npm run preview`    | Preview production build locally  |
| `npm test`           | Run Vitest once (CI / pre-commit) |
| `npm run test:watch` | Vitest watch mode                 |
| `npm run lint`       | ESLint                            |


Git **pre-commit** (Husky) runs **lint-staged** (ESLint on staged TS/TSX), `**npm test`**, and `**npm run build`**.

## API note

CoinGecko applies **rate limits** (e.g. HTTP 429). The app surfaces a dedicated message and **Retry** for the markets list; detail/chart errors show inline retry where applicable.

## Technical Decisions

I chose React 19 with TypeScript and Vite to build a fast, strongly typed UI, aligning with the requirement for functional components and strict typing. For server state management, I used TanStack Query to handle caching, retries, and rate limiting as outlined in the design. Styling was implemented with Tailwind CSS v4 for speed and consistency, and Recharts was used for lightweight data visualization such as sparklines and the 7-day price chart. I intentionally avoided using a headless or component library and implemented accessibility manually to demonstrate a clear understanding of a11y requirements. The table is keyboard-navigable at the row level, as each row acts as a single interactive unit that opens a detail view; for more complex scenarios, this could be extended to a full grid pattern with cell level navigation. Accessibility was validated both manually using VoiceOver and through automated checks with jest-axe. I also chose not to include a routing library and handled URL state directly given the small scope of the application. For testing, I used Vitest and Testing Library to focus on behavior and requirements rather than implementation details. The project structure follows a by type organization with components, hooks, and utilities, with the option to evolve into a feature based structure as the codebase grows by renaming some folder, but small functions and components are ready.

## AI usage

AI was used as a structured productivity tool across the full development lifecycle, not as a source of truth. I started by using AI to generate an initial set of requirements [REQUIREMENTS.md](./docs/REQUIREMENTS.md), which I manually reviewed, refined, and filtered for correctness. Based on that, I created [DESIGN.md](./docs/DESIGN.md)  to capture architecture, decisions, and implementation details, and [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) to enforce conventions, which I updated iteratively whenever AI outputs did not meet expectations. I then built a [PLAN.md](./docs/PLAN.md) with incremental steps, investing significant time refining it since it guided the implementation. During development, I used AI to assist with coding, refactoring, and tests, but every change was manually reviewed, adjusted, or rejected as needed. Work was done in small steps with commits gated by automated checks such as build, lint, formatting, and unit tests. Finally, I verified completeness against the requirements using a checklist and additional AI passes. This approach ensures AI accelerates execution while maintaining full control over correctness, design integrity, and code quality.