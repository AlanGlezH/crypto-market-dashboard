# Implementation plan — Crypto Market Dashboard

Use this file **step by step**. After each step, **pause** so you can **review** the changes and the step’s **Review** checklist; **you** **`git commit`** when satisfied, then move on. Sources of truth: [REQUIREMENTS.md](./REQUIREMENTS.md), [DESIGN.md](./DESIGN.md).

**Visual reference (non-authoritative):** [dashboard.png](./docs/design/dashboard.png) and [drawer.png](./docs/design/drawer.png) are UI mockups (e.g. Stitch). Use them for **layout, typography, spacing, and component grouping** only. If anything in the images conflicts with [REQUIREMENTS.md](./REQUIREMENTS.md) or [DESIGN.md](./DESIGN.md), **follow REQUIREMENTS + DESIGN** and omit decorative or out-of-scope elements (extra footer actions, non-spec chrome, etc.).

**Workflow**

1. Mark the step **in progress** (mentally or with a local note).
2. Implement only what that step lists, and add or update **automated tests** for that step (see **Testing** below). Tooling-only steps may add no new tests but must keep the suite green.
3. **Pause for review:** inspect the diff, run **`npm test`** and the app if relevant, and work through the step’s **Review** checklist. Adjust until you are happy with the step.
4. **`git commit` yourself** using the step’s **suggested message** as the subject line. Messages must follow **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)**: `type(optional scope): description` in the **imperative** (“add”, not “added”). Adjust scope or add a **body**/`BREAKING CHANGE` footer if needed; keep the same type and intent as the suggestion. Do not treat the step as done until you have committed.
5. Optional: after all steps, revisit **folder structure** (DESIGN §2 note / NFR-DES-3).

**Conventional Commits — types used in this plan:** `feat` (behavior/UI), `fix` (bugs), `chore` (tooling/scaffold/deps), `docs` (README only), `style` (formatting/visual polish without logic change), `test` (tests only—optional split from `feat` if you prefer tiny commits). Scopes like `api`, `table`, `detail`, `ui`, `a11y` match areas under `src/`.

**Testing (every step)**

- **Stack:** **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **@testing-library/jest-dom** + **jsdom** (Vite’s official pattern). Optional: **MSW** to mock `fetch` for API modules.
- **Principle:** Prefer tests that guard **requirements** and **regressions**: user-visible behavior, pure utilities, error paths, and accessibility roles/labels—not implementation trivia.
- **Each step** lists **Tests** (what to add). If a step is dependency-only, keep **`npm test`** green with no new files.
- **CI habit:** Run the full suite before every commit; fix flaky tests immediately.

---

## Step 01 — Project scaffold (Vite + React + TS)

| | |
|---|---|
| **FR** | FR-6.1, FR-6.2 |
| **Goal** | Runnable app with TypeScript strict enough for the challenge. |

**Do**

- Create Vite project: React + TypeScript (official template).
- Confirm `npm run dev` works and shows a placeholder page.
- Add **Vitest** + **@testing-library/react** + **@testing-library/jest-dom** + **@testing-library/user-event** + **jsdom**; `vitest.config.ts` with the React plugin; `test` script in `package.json`.
- Add a smoke test (e.g. `App.test.tsx`) that renders `<App />` and asserts something visible (e.g. heading or root text).

**Tests**

- Smoke: app renders without throw; one meaningful `expect` on visible content.

**Review**

- [ ] No class components introduced.
- [ ] `tsconfig` reasonable (strict or `strict`-ish—avoid loose `any` habit).
- [ ] `npm test` passes.

**Commit message:** `chore: scaffold Vite React TypeScript app`

---

## Step 02 — Tailwind CSS (v4)

| | |
|---|---|
| **FR** | FR-6.5 |
| **Goal** | Tailwind **v4** installed and applied in the app shell. |

**Do**

- Install **`tailwindcss`** and **`@tailwindcss/vite`** (Tailwind v4 official Vite integration). No separate `postcss` / `autoprefixer` install for the default path—the Vite plugin handles the pipeline.
- In **`vite.config.ts`**, add the `@tailwindcss/vite` plugin alongside `@vitejs/plugin-react`.
- In the app’s global CSS entry (e.g. **`src/index.css`**), add **`@import "tailwindcss";`** and remove legacy Vite/React boilerplate CSS that would conflict, if any.
- Replace placeholder with a minimal layout (header + main) using Tailwind classes.

**Tests**

- Extend smoke test (or add one) to assert the **header** (or main landmark) is present so Tailwind-wrapped layout stays covered.

**Review**

- [ ] Utility classes work on a test element.
- [ ] Global/base styles don’t fight the table later (keep base minimal).
- [ ] `npm test` passes.

**Commit message:** `chore: add Tailwind CSS v4`

---

## Step 03 — Dependencies: TanStack Query + Recharts

| | |
|---|---|
| **FR** | FR-6.3 |
| **Goal** | Dependencies installed; no usage required yet. |

**Do**

- Install `@tanstack/react-query` (v5 per DESIGN).
- Install `recharts`.

**Tests**

- No new tests required; confirm the existing suite still runs after install.

**Review**

- [ ] Lockfile updated; app still builds.
- [ ] `npm test` passes.

**Commit message:** `chore: add TanStack Query and Recharts`

---

## Step 04 — Folder skeleton (empty or stub files)

| | |
|---|---|
| **FR** | NFR-DES-3 |
| **Goal** | Match DESIGN §2 tree so later steps have clear homes. |

**Do**

- Create `src/api/`, `src/components/table|detail|ui/`, `src/hooks/`, `src/utils/`.
- Add minimal exports or placeholder components if needed so the project compiles.

**Tests**

- Keep the smoke test passing; add a trivial render test for any **placeholder component** that ships in this step (if none, suite green only).

**Review**

- [ ] Paths align with DESIGN (names can vary slightly if documented in commit body).
- [ ] `npm test` passes.

**Commit message:** `chore: add src folder structure per design`

---

## Step 05 — API types (`api/types.ts`)

| | |
|---|---|
| **FR** | FR-6.2 |
| **Goal** | Typed shapes for markets list, detail, and market chart. |

**Do**

- Add `CoinMarket`, `CoinDetail` (with optional/nullable fields where DESIGN warns), `MarketChart`, `SparklineData` per DESIGN §3.
- No `any` on API payloads.

**Tests**

- Optional: small **type-level** or runtime test only if you add sample fixtures (e.g. `*.test.ts` parsing a JSON fixture into typed objects). Otherwise suite green only.

**Review**

- [ ] Fields needed for table + drawer + chart are covered.
- [ ] `description.en` / `image` not assumed always present if you typed them strict.
- [ ] `npm test` passes.

**Commit message:** `feat(api): add CoinGecko response types`

---

## Step 06 — Fetch helper + `RateLimitError` (`api/coingecko.ts` part 1)

| | |
|---|---|
| **FR** | FR-5.1, FR-6.2 |
| **Goal** | Single place that maps HTTP errors; 429 distinguishable. |

**Do**

- Implement thin `fetch` wrapper or helpers: throw a custom **`RateLimitError`** on status **429**; throw a generic error (or typed `ApiError`) on other failures.
- Do **not** wire UI yet.

**Tests**

- **Unit tests** with **mocked `global.fetch`**: 429 → `RateLimitError`; 500/404 → generic error; 200 + JSON → parsed value.

**Review**

- [ ] Callers can branch on `instanceof RateLimitError`.
- [ ] No `any` for JSON bodies.
- [ ] `npm test` passes.

**Commit message:** `feat(api): add fetch helper and RateLimitError`

---

## Step 07 — `fetchMarkets` + markets URL

| | |
|---|---|
| **FR** | FR-1.1 |
| **Goal** | Typed function returns `CoinMarket[]` from the exact challenge query string. |

**Do**

- Implement `GET /coins/markets` with `vs_currency=usd`, `order=market_cap_desc`, `per_page=20`, `page=1`, `sparkline=true`.
- Parse JSON to `CoinMarket[]`.

**Tests**

- Mock `fetch`: assert **request URL** contains required query params; success returns an array; error path uses Step 06 behavior.

**Review**

- [ ] Params match REQUIREMENTS FR-1.1.
- [ ] Handles non-OK responses via Step 06.
- [ ] `npm test` passes.

**Commit message:** `feat(api): add fetchMarkets for top 20 markets`

---

## Step 08 — `QueryClientProvider` + defaults

| | |
|---|---|
| **FR** | FR-6.3 |
| **Goal** | Global React Query config: `staleTime`, retry policy (no blind retry on 429). |

**Do**

- Wrap app in `QueryClientProvider` (DESIGN §4).
- Set `staleTime` (~55s) and `retry` that returns **false** for `RateLimitError`, else limited retries. Keeps focus/remount refetches down; markets still use `refetchInterval: 60_000` in Step 09.

**Tests**

- Wrap test renders in a **`QueryClientProvider`** (fresh `QueryClient` per test). Smoke test still passes.

**Review**

- [ ] App still renders.
- [ ] Defaults documented in a one-line comment if helpful.
- [ ] `npm test` passes.

**Commit message:** `feat: configure TanStack Query client defaults`

---

## Step 09 — `useMarkets` hook

| | |
|---|---|
| **FR** | FR-1.1, FR-1.2, FR-6.3 |
| **Goal** | Query key `['markets']`, `refetchInterval: 60_000`. |

**Do**

- `useQuery` with `queryFn: fetchMarkets`, `refetchInterval: 60_000`.

**Tests**

- **`renderHook`** (or small test component) with mocked `fetchMarkets`: success exposes **data**; failure exposes **error**; optional: `waitFor` + fake timers to assert **`refetchInterval`** is configured (e.g. query key + option snapshot or behavioral refetch).

**Review**

- [ ] DevTools or network shows refetch every ~60s while page open.
- [ ] `isLoading` / `isFetching` / `error` available for UI.
- [ ] `npm test` passes.

**Commit message:** `feat: add useMarkets with 60s refetch`

---

## Step 10 — Format utilities (`utils/format.ts`)

| | |
|---|---|
| **FR** | FR-2.3, FR-2.5 |
| **Goal** | `formatUSD`, `formatMarketCap`, `formatPct` (or equivalent). |

**Do**

- Implement human-readable market cap (DESIGN §7).
- Price and % formatting used by the table later.

**Tests**

- **Unit tests** for `formatUSD`, `formatMarketCap`, `formatPct`: known inputs → expected strings; edge cases (0, large values, null/undefined if you handle them).

**Review**

- [ ] Handles `null`/undefined prices if API omits (defensive).
- [ ] `npm test` passes.

**Commit message:** `feat: add format helpers for price, cap, and percent`

---

## Step 11 — `ErrorBanner` + markets error UI

| | |
|---|---|
| **FR** | FR-5.1, FR-5.2 |
| **Goal** | When markets query fails, user sees message + **Retry** (`refetch`). |

**Do**

- `components/ui/ErrorBanner.tsx`: message, Retry button, optional variant for rate limit copy.
- In `App` (or markets section): if `useMarkets` is error, show banner; Retry calls `refetch`.

**Tests**

- **RTL:** `ErrorBanner` renders message + **Retry**; clicking calls `onRetry` once.
- **Integration-style:** mock `useMarkets` as **error** (`RateLimitError` vs generic); assert copy and retry triggers refetch mock.

**Review**

- [ ] 429 path shows friendly “rate limit” style text.
- [ ] Non-429 shows generic error + retry.
- [ ] No infinite auto-retry loop.
- [ ] `npm test` passes.

**Commit message:** `feat(ui): add ErrorBanner and wire markets query errors`

---

## Step 12 — `SkeletonTable`

| | |
|---|---|
| **FR** | FR-1.3 |
| **Goal** | Loading UI that mirrors the table layout. |

**Do**

- `SkeletonTable.tsx`: row/column placeholders, pulse animation.

**Tests**

- Render `SkeletonTable`; assert **skeleton rows/cells** or `aria-busy` / role patterns if you add them; at minimum snapshot or count of placeholder elements.

**Review**

- [ ] Shown while `useMarkets` is initial loading (and optionally during refetch—your choice; document in README if subtle).
- [ ] `npm test` passes.

**Commit message:** `feat(ui): add skeleton loading state for markets table`

---

## Step 13 — `MarketTable` + `TableRow` (static columns, no sort/search yet)

| | |
|---|---|
| **FR** | FR-2.1–FR-2.5 (sparkline can be placeholder until Step 14) |
| **Goal** | Semantic `<table>` with correct data columns. |

**Do**

- Render all required columns; wire formatting from Step 10.
- FR-2.4: color + **non-color** cue (icon or “up/down” text).

**Tests**

- Pass **fixture `CoinMarket[]`** (2–3 rows); assert headers and cell text (rank, name, formatted price, 24h cue present).
- Assert **24h** cell exposes non-color cue (e.g. **arrow** `aria-hidden` + text, or visible **+/-**).

**Review**

- [ ] Rank, name+image, price, 24h %, market cap present.
- [ ] Valid HTML table structure (`thead`/`tbody`, `th` scope).
- [ ] `npm test` passes.

**Commit message:** `feat(table): render market overview columns`

---

## Step 14 — `Sparkline` column

| | |
|---|---|
| **FR** | FR-2.6, NFR-DES-1 |
| **Goal** | Small Recharts line from `sparkline_in_7d.price`; stroke from **24h %** or neutral. |

**Do**

- `Sparkline.tsx` per DESIGN §7 (no axes/tooltip).
- Sort key for later: e.g. **last price** in series (document in code comment).

**Tests**

- Render row with **empty** / **missing** sparkline data → no throw.
- With numeric array, assert **ResponsiveContainer** / chart renders (e.g. `container.querySelector('svg')` or role if applicable).

**Review**

- [ ] Empty/missing sparkline does not crash row.
- [ ] Stroke color policy matches DESIGN (24h % or neutral).
- [ ] `npm test` passes.

**Commit message:** `feat(table): add 7d sparkline column with Recharts`

---

## Step 15 — Client-side sort (`utils/sort.ts` + `SortHeader`)

| | |
|---|---|
| **FR** | FR-3.1 |
| **Goal** | Every column sortable; `aria-sort` on active header. |

**Do**

- State: `{ column, direction }`; `useMemo` for sorted data.
- `SortHeader`: button in `th`, toggles asc/desc.

**Tests**

- **Unit:** `sort` util / sorted array order for 2–3 fixture rows per column.
- **RTL:** click **sort** button → first row’s value changes as expected; **`aria-sort`** on active `th` (`ascending` / `descending`).

**Review**

- [ ] Clicking headers reorders without refetch.
- [ ] `aria-sort` reflects active column.
- [ ] `npm test` passes.

**Commit message:** `feat(table): add client-side sortable columns`

---

## Step 16 — Search + empty state

| | |
|---|---|
| **FR** | FR-3.2, FR-3.3 |
| **Goal** | `SearchInput` filters name/symbol live; `EmptyState` when zero rows. |

**Do**

- Case-insensitive match recommended.
- Distinguish “no data from API” vs “no search matches” if both can occur.

**Tests**

- **RTL:** type in search → row count updates; query matching **name** and **symbol** (case-insensitive).
- **EmptyState:** when filter matches nothing, assert **empty message** is visible (not a bare empty table).

**Review**

- [ ] Typing filters immediately.
- [ ] Zero matches shows clear empty state copy.
- [ ] `npm test` passes.

**Commit message:** `feat(table): add search filter and empty state`

---

## Step 17 — Table keyboard navigation (headers + rows)

| | |
|---|---|
| **FR** | FR-3.4 |
| **Goal** | Tab to header buttons and rows; Enter (and/or Space) activates. |

**Do**

- Rows: `tabIndex={0}` or roving tabindex pattern—pick one and stay consistent.
- If drawer is not wired yet, use stub `onSelectCoin(id)`; complete wiring in Step 26.

**Tests**

- **userEvent:** **Tab** to sort **button**, **Enter**/`Space` toggles sort (if not covered in Step 15).
- **Tab** to row, **Enter** (and **Space** if spec’d) calls **`onSelectCoin`** with correct **id**.

**Review**

- [ ] Sort works from keyboard on headers.
- [ ] Row activates selection without mouse once drawer exists.
- [ ] `npm test` passes.

**Commit message:** `feat(a11y): keyboard support for sort headers and table rows`

---

## Step 18 — URL param for selected coin (`?coin=id`)

| | |
|---|---|
| **FR** | FR-4.7 |
| **Goal** | Read/write `coin` search param; reload preserves selection. |

**Do**

- Use `URLSearchParams` + `history.replaceState` / `pushState`, or minimal router—keep global state minimal per DESIGN.

**Tests**

- **`vi.stubGlobal` / `window.history`** or small wrapper: setting **`?coin=`** updates internal state/hook return; clearing param clears selection.
- If using **`react-router`**, memory router + `initialEntries` tests.

**Review**

- [ ] Copy-paste URL with `?coin=bitcoin` opens same coin after reload.
- [ ] Invalid id fails gracefully (optional nice-to-have).
- [ ] `npm test` passes.

**Commit message:** `feat: sync selected coin with URL search params`

---

## Step 19 — `fetchCoinDetail` + `useCoinDetail`

| | |
|---|---|
| **FR** | FR-4.2, FR-4.3 (partial), FR-6.3 |
| **Goal** | Query with challenge query params; `enabled: !!id`. |

**Do**

- `GET /coins/{id}` with `localization=false&tickers=false&community_data=false&developer_data=false`.
- `staleTime` ~5 min per DESIGN.

**Tests**

- Mock **`fetch`**: URL includes required query string; **`enabled: false`** when `id` is **null** (assert `fetch` not called via `renderHook`).
- Success path returns typed detail.

**Review**

- [ ] No fetch when `id` is null.
- [ ] Types + null-safe access for optional description/image.
- [ ] `npm test` passes.

**Commit message:** `feat(api): add coin detail fetch and useCoinDetail hook`

---

## Step 20 — `fetchMarketChart` + `useMarketChart`

| | |
|---|---|
| **FR** | FR-4.4, FR-6.3 |
| **Goal** | `market_chart` `days=7`, `vs_currency=usd`. |

**Do**

- `enabled: !!id` (optional: gate on detail success per DESIGN §6—only if you need it).

**Tests**

- Mock **`fetch`**: `days=7` and `vs_currency=usd` in URL; **`id` null** → no request; JSON maps to **`prices`** array.

**Review**

- [ ] `prices` array drives chart data shape `[timestamp, price]`.
- [ ] `npm test` passes.

**Commit message:** `feat(api): add market chart fetch and useMarketChart hook`

---

## Step 21 — `DetailDrawer` shell + open/close

| | |
|---|---|
| **FR** | FR-4.1, FR-4.6 (partial) |
| **Goal** | Side panel opens on row click; close button clears `?coin`. |

**Do**

- Overlay + panel layout; click outside to close optional (document behavior).

**Tests**

- **RTL:** open state renders **`role="dialog"`** (if present this step) or panel + **close** control; click **close** invokes **`onClose`** / clears URL (per implementation).

**Review**

- [ ] Desktop: table still partially visible (drawer, not full opaque takeover).
- [ ] Mobile: acceptable full-width behavior.
- [ ] `npm test` passes.

**Commit message:** `feat(detail): add side drawer shell and URL wiring`

---

## Step 22 — Drawer content: header, price, ATH/ATL

| | |
|---|---|
| **FR** | FR-4.3 |
| **Goal** | Show name, logo, current USD, ATH+date, ATL+date with fallbacks. |

**Do**

- Use `useCoinDetail` data; skeleton while loading (`SkeletonDetail`).

**Tests**

- Mock **success** detail: assert **name**, **price**, **ATH/ATL** labels and values visible.
- Mock **loading**: skeleton or loading text visible.

**Review**

- [ ] Missing `description` does not break layout.
- [ ] `npm test` passes.

**Commit message:** `feat(detail): show coin summary and ATH/ATL in drawer`

---

## Step 23 — `PriceChart` (7d)

| | |
|---|---|
| **FR** | FR-4.4 |
| **Goal** | Recharts chart from `useMarketChart` data. |

**Do**

- Loading/error states inside drawer for chart query.

**Tests**

- With **fixture chart data**, assert **svg** (Recharts) renders inside drawer.
- Loading/error: compact message or retry visible per implementation.

**Review**

- [ ] Chart readable (axes/labels minimal but clear).
- [ ] Empty data handled.
- [ ] `npm test` passes.

**Commit message:** `feat(detail): add 7-day price chart`

---

## Step 24 — Description truncate + read more

| | |
|---|---|
| **FR** | FR-4.5, NFR-DES-2 |
| **Goal** | ~300 chars, toggle expand/collapse; strip HTML if API returns HTML. |

**Do**

- If `description.en` is HTML, strip or render safely (plain text strip is acceptable for a take-home if documented).

**Tests**

- Long description: initially **truncated**; click **Read more** → full text (or expanded); **Read less** collapses.
- Missing description: empty/fallback copy.

**Review**

- [ ] Empty/missing description shows sensible empty copy.
- [ ] `npm test` passes.

**Commit message:** `feat(detail): add description excerpt with read more`

---

## Step 25 — Drawer accessibility polish

| | |
|---|---|
| **FR** | FR-4.6, FR-6.6 |
| **Goal** | `role="dialog"`, `aria-labelledby`, focus trap or documented focus move, **Escape** closes. |

**Do**

- On open: focus moves into drawer; on close: focus returns to triggering row (ideal) or sensible fallback.

**Tests**

- **`role="dialog"`**, **`aria-labelledby`** (or **label**) present.
- **userEvent:** **Escape** fires close; if focus trap testable, assert focus on **close** button after open (may require `skipPointerEventsCheck` / fake timers per RTL docs).

**Review**

- [ ] Escape closes.
- [ ] No focus lost to void.
- [ ] `npm test` passes.

**Commit message:** `feat(a11y): focus management and dialog semantics for drawer`

---

## Step 26 — Wire row click + keyboard to open drawer

| | |
|---|---|
| **FR** | FR-4.1, FR-3.4 |
| **Goal** | Row click sets `?coin=id` and opens drawer; keyboard selection matches. |

**Do**

- Ensure URL uses CoinGecko `id` (e.g. `bitcoin`).

**Tests**

- **Integration:** mock markets list → **click row** → URL contains **`coin=`** + drawer content loads (queries mocked).
- Repeat **keyboard** **Enter** on row if not already covered in Step 17.

**Review**

- [ ] Click and keyboard both work.
- [ ] Drawer loads detail + chart for selected id.
- [ ] `npm test` passes.

**Commit message:** `feat: open detail drawer from table row selection`

---

## Step 27 — Loading/error inside drawer

| | |
|---|---|
| **FR** | FR-1.3 (pattern), FR-5.2 |
| **Goal** | `SkeletonDetail` for detail load; chart loading; inline retry if desired. |

**Do**

- Reuse `ErrorBanner` or compact inline error + retry for detail/chart.

**Tests**

- Mock **detail error** / **chart error**: assert **retry** or banner; **loading** shows skeletons, not empty panel.

**Review**

- [ ] User never sees a blank drawer on slow network.
- [ ] `npm test` passes.

**Commit message:** `feat(detail): loading skeletons and error states`

---

## Step 28 — Visual + WCAG pass

| | |
|---|---|
| **FR** | FR-6.5, FR-6.6 |
| **Goal** | Consistent spacing/type/color; contrast AA on text and controls. |

**Do**

- Check table headers, 24h %, buttons, empty state, drawer text on background.

**Tests**

- No new tests **required** unless you add **contrast-critical** utilities; re-run full suite and fix any **a11y** regressions caught by tests.

**Review**

- [ ] Focus visible on interactive elements.
- [ ] No information by color alone (FR-2.4 re-verify).
- [ ] `npm test` passes.

**Commit message:** `style: polish layout and contrast for WCAG AA`

---

## Step 29 — README (deliverable)

| | |
|---|---|
| **FR** | FR-7.1 |
| **Goal** | Run instructions + 1 paragraph technical decisions + 1 paragraph AI usage. |

**Do**

- Node version, install, `dev` script, build optional.
- Mention CoinGecko rate limits briefly.
- Document **`npm test`** (and **`npm run test -- --run`** if using Vitest watch defaults).

**Tests**

- No code tests; README must mention how to run the suite.

**Review**

- [ ] A stranger can run the app from README alone.
- [ ] `npm test` passes.

**Commit message:** `docs: add README with run instructions and AI usage`

---

## Step 30 — Final smoke test + optional folder refactor

| | |
|---|---|
| **FR** | All; NFR-DES-3 |
| **Goal** | Walk REQUIREMENTS top to bottom once; refactor folders only if justified. |

**Do**

- Manual checklist against [REQUIREMENTS.md](./REQUIREMENTS.md) FR IDs.
- Optional: by-feature folders; if skipped, note in README “future structure.”
- Run **full test suite** once; add **one missing test** if manual QA found an uncovered FR gap.

**Tests**

- Entire suite green; coverage sanity: critical paths (markets load, error retry, sort, search empty, drawer open/close, description toggle) have at least one automated test each.

**Review**

- [ ] All FR boxes you care about are satisfied.
- [ ] `git status` clean; ready for `main` / PR.
- [ ] `npm test` passes.

**Commit message:** `chore: final checks` (or no commit if only verification)

---

## Appendix — Optional splits

If you want **even smaller** commits, split these steps further:

- **Step 13** → one commit for table shell, second for row content.
- **Step 15** → one commit for sort util, second for header UI.
- **Step 21–22** → drawer layout vs drawer data.

## Appendix — Conflict rule

If **DESIGN.md** and **REQUIREMENTS.md** disagree, **REQUIREMENTS.md** wins (employer brief).
