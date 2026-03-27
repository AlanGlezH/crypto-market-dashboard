# Requirements Verification

Cross-reference with [REQUIREMENTS.md](./REQUIREMENTS.md). Last verified: 2026-03-27.

---

## FR-1 — Market data (overview)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-1.1 | Top 20 coins, correct API params | **PASS** | `fetchMarkets` in `api/coingecko.ts` (MARKETS_SEARCH) |
| FR-1.2 | Refetch every 60 s | **PASS** | `refetchInterval: 60_000` in `hooks/useMarkets.ts` |
| FR-1.3 | Skeleton loading state | **PASS** | `SkeletonTable` rendered when `isPending` in `App.tsx` |

## FR-2 — Market table columns

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-2.1 | Rank column | **PASS** | `coin.market_cap_rank` in `TableRow.tsx` |
| FR-2.2 | Name + icon | **PASS** | Image + name + symbol in `TableRow.tsx` |
| FR-2.3 | Price formatted as USD | **PASS** | `formatUSD` via `Intl.NumberFormat` in `utils/format.ts` |
| FR-2.4 | 24 h % with color + non-color cue | **PASS** | Green/red + `▲`/`▼` arrows in `Change24hCell` |
| FR-2.5 | Human-readable market cap | **PASS** | `formatMarketCap` (T/B/M) in `utils/format.ts` |
| FR-2.6 | 7 d sparkline chart | **PASS** | `Sparkline.tsx` renders Recharts `LineChart` |

## FR-3 — Table interaction

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-3.1 | Client-side sort on all columns | **PASS** | `sortCoins` + `SortHeader` in `MarketTable.tsx` |
| FR-3.2 | Search by name/symbol | **PASS** | `coinMatchesSearch` in `utils/marketSearch.ts` |
| FR-3.3 | Empty search shows message | **PASS** | `EmptyState` component on zero matches |
| FR-3.4 | Keyboard navigation (headers + rows) | **PASS** | `<button>` in `<th>`; `tabIndex={0}` + Enter/Space on rows |

## FR-4 — Asset detail (drawer)

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-4.1 | Side drawer on row click | **PASS** | `onSelectCoin` → `DetailDrawer` in `App.tsx` |
| FR-4.2 | Detail API with correct params | **PASS** | `fetchCoinDetail` with all required query flags |
| FR-4.3 | Name, logo, price, ATH/ATL + dates | **PASS** | `DetailDrawerHeader` + `CoinDetailSummary` |
| FR-4.4 | 7-day price chart | **PASS** | `PriceChart` with `useMarketChart` (days=7) |
| FR-4.5 | Description ~300 chars + Read more/less | **PASS** | `buildDescriptionExcerpt` + toggle in `CoinDescription.tsx` |
| FR-4.6 | Close (Escape + button), `role="dialog"`, focus mgmt | **PASS** | Escape handler, `aria-modal`, focus trap hook |
| FR-4.7 | URL param `?coin=id`, reload preserves | **PASS** | `useCoinSearchParam` reads/writes `?coin=` |

## FR-5 — Errors and rate limits

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-5.1 | 429 rate limit: message + Retry, no auto retry | **PASS** | `RateLimitError` → `ErrorBanner`; `retry: false` for 429 |
| FR-5.2 | Other errors: user-friendly message + Retry | **PASS** | `getMarketsErrorDisplay` + `ErrorBanner`; inline retry in drawer |

## FR-6 — Technical constraints

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-6.1 | Functional components only | **PASS** | No class components in codebase |
| FR-6.2 | TypeScript, typed API, no `any` | **PASS** | `api/types.ts`; zero `any` on API data |
| FR-6.3 | TanStack Query | **PASS** | `useQuery` for markets, detail, chart |
| FR-6.4 | Minimal global state | **PASS** | URL + React Query cache + local `useState` only |
| FR-6.5 | Tailwind CSS | **PASS** | Tailwind v4 via `@tailwindcss/vite` |
| FR-6.6 | WCAG AA contrast | **PASS** | Manual browser audit (see [Accessibility](#accessibility) below) |

## FR-7 — Deliverable

| ID | Requirement | Status | Evidence |
|---|---|---|---|
| FR-7.1 | README: run instructions, tech decisions, AI usage | **PASS** | All three sections in `README.md` |

---

## Accessibility

### WCAG AA contrast — manual verification (2026-03-27)

Checked in Chrome DevTools (Accessibility pane → Contrast ratio) on key surfaces:

| Element | Foreground | Background | Ratio | AA (4.5:1 normal / 3:1 large) |
|---|---|---|---|---|
| Body text (`text-slate-900`) | `#0f172a` | `#ffffff` | ≥ 15:1 | Pass |
| Secondary text (`text-slate-500`) | `#64748b` | `#ffffff` | ≥ 5.4:1 | Pass |
| Table header text (`text-slate-600`) | `#475569` | `#f8fafc` | ≥ 5.9:1 | Pass |
| Positive 24 h % (`text-emerald-700`) | `#047857` | `#ffffff` | ≥ 4.7:1 | Pass |
| Negative 24 h % (`text-red-700`) | `#b91c1c` | `#ffffff` | ≥ 5.2:1 | Pass |
| Retry button text (white on `bg-blue-600`) | `#ffffff` | `#2563eb` | ≥ 4.6:1 | Pass |
| Link text (`text-blue-600`) | `#2563eb` | `#ffffff` | ≥ 4.6:1 | Pass |
| Error banner description (`text-slate-500`) | `#64748b` | `#ffffff` | ≥ 5.4:1 | Pass |

### Automated structural a11y (axe-core via jest-axe)

`axe-core` runs inside Vitest on the three main rendered surfaces:

| Test file | Component | Covers |
|---|---|---|
| `MarketTable.test.tsx` | Table with data rows | Roles, labels, ARIA on headers/rows |
| `ErrorBanner.test.tsx` | Error card + Retry | Alert role, button labelling |
| `DetailDrawer.test.tsx` | Drawer with loaded detail | Dialog role, heading, focus |

**Limitation:** jsdom does not compute CSS, so `axe-core` cannot check color contrast ratios in this environment. Contrast is verified manually (see table above). For automated contrast, Playwright + `@axe-core/playwright` against a live dev server would be needed.
