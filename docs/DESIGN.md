# Crypto Market Dashboard — Design Document

v1.0 · draft · generated from challenge specs

**Visual mockups (guide only):** [dashboard.png](./design/dashboard.png), [drawer.png](./design/drawer.png). Non-authoritative; [REQUIREMENTS.md](./REQUIREMENTS.md) and this document prevail when there is a conflict.

---

## 1. Stack


| Area          | Choice            | Rationale                                                                        |
| ------------- | ----------------- | -------------------------------------------------------------------------------- |
| Build tool    | Vite + React + TS | Fast DX, native ESM, no CRA bloat                                                |
| Data fetching | TanStack Query v5 | Required by spec; handles caching, background refresh, stale state               |
| Styling       | Tailwind CSS v4   | Preferred by spec; utility-first, consistent spacing/color (`@tailwindcss/vite`) |
| Charts        | Recharts          | React-native, composable, good TS support                                        |
| Routing       | URL params only   | No page transitions needed; `?coin=bitcoin` for detail state                     |
| HTTP client   | native fetch      | No extra dependency; wrapped in typed service layer                              |


---

## 2. Folder structure

```
src/
├── api/
│   ├── coingecko.ts        # typed fetch functions (no hooks here)
│   └── types.ts            # CoinMarket, CoinDetail, MarketChart types
├── components/
│   ├── table/
│   │   ├── MarketTable.tsx
│   │   ├── TableRow.tsx
│   │   ├── SortHeader.tsx
│   │   ├── Sparkline.tsx
│   │   └── SkeletonTable.tsx
│   ├── detail/
│   │   ├── DetailDrawer.tsx
│   │   ├── PriceChart.tsx
│   │   └── SkeletonDetail.tsx
│   └── ui/
│       ├── ErrorBanner.tsx    # rate limit / generic errors
│       ├── EmptyState.tsx
│       └── SearchInput.tsx
├── hooks/
│   ├── useMarkets.ts          # useQuery wrapper for /coins/markets
│   ├── useCoinDetail.ts       # useQuery wrapper for /coins/{id}
│   └── useMarketChart.ts      # useQuery wrapper for /coins/{id}/market_chart
├── utils/
│   ├── format.ts              # formatUSD, formatMarketCap, formatPercentage
│   └── sort.ts                # generic column sort util
└── App.tsx                    # QueryClientProvider, layout, URL param read
```

---

## 3. API types

> All types derived from actual API shapes. No `any`. Zod optional stretch goal for runtime validation.

```ts
// api/types.ts

export interface SparklineData {
  price: number[];
}

export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: SparklineData;
}

export interface CoinDetail {
  id: string;
  name: string;
  symbol: string;
  image: { large: string };
  market_data: {
    current_price: { usd: number };
    ath: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_date: { usd: string };
  };
  description: { en: string };
}

export interface MarketChart {
  prices: [number, number][]; // [timestamp, price]
}
```

**Optional fields / nullability:** Model types against real responses where the UI reads them. CoinGecko quirks: detail `description.en` can be missing or empty; `image` shape may vary—use optional chaining, fallbacks, or wider unions so the UI does not assume a fixed shape.

---

## 4. React Query setup

```ts
// App.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 55_000,       // fresh ~55s: fewer refetches on focus/remount; markets still poll every 60s
      retry: (count, err) =>   // don't retry 429s
        err instanceof RateLimitError ? false : count < 2,
    },
  },
});

// hooks/useMarkets.ts
export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    refetchInterval: 60_000,
  });
}

// hooks/useCoinDetail.ts
export function useCoinDetail(id: string | null) {
  return useQuery({
    queryKey: ['coin', id],
    queryFn: () => fetchCoinDetail(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,     // detail changes less often; cache 5 min
  });
}
```

---

## 5. State strategy


| State                   | Where                     | Why                                      |
| ----------------------- | ------------------------- | ---------------------------------------- |
| Selected coin (drawer)  | URL param `?coin=bitcoin` | Survives reload, shareable link          |
| Search query            | `useState` in App         | Ephemeral, no reason to persist          |
| Sort column + direction | `useState` in MarketTable | Local UI state, client-side only         |
| Market data             | React Query cache         | Shared across components, auto-refreshed |
| Detail + chart data     | React Query cache         | Keyed by coin id, cached 5 min           |


---

## 6. Error and loading states

> CoinGecko free tier: ~30 req/min. With auto-refresh + detail fetches, budget carefully.

- **Parallel detail requests:** Opening the drawer fires two requests (coin detail + market chart). Global `staleTime` (~55s) and per-query `staleTime` on detail (and chart, if you add one) limit repeat traffic. If 429s show up in practice, optionally set the chart query’s `enabled` to wait until detail has succeeded—nice-to-have, not required for the spec.
- **Loading:** skeleton components that mirror the real layout (table rows with pulse animation, chart placeholder)
- **Rate limit (429):** custom `RateLimitError` class thrown from `coingecko.ts`. `ErrorBanner` shows user-friendly message + retry button. React Query `retry: false` on 429.
- **Generic error:** `ErrorBanner` with retry. React Query retries 2× before surfacing.
- **Empty search:** `EmptyState` component when filtered rows length is 0.

---

## 7. Key implementation details

### Sparkline

Use a headless `<Sparkline />` component that renders a small `ResponsiveContainer + LineChart` from Recharts with no axes, no tooltip, no dots. ~60×32px inline. Data is **7d** (`sparkline_in_7d.price`); **stroke color** follows `**price_change_percentage_24h`** (green if positive, red if negative, neutral if missing or zero) so the row matches the spec’s 24h % column and avoids conflicting “7d shape vs 24h sign” signals. Acceptable alternative: **neutral** stroke (e.g. gray) and rely on the 24h % cell for red/green—do **not** derive stroke color from 7d start/end unless the UI explicitly labels that as a week trend.

### Market cap formatting

```ts
// utils/format.ts
export function formatMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}
```

### Sorting

Single `{ column: keyof CoinMarket, direction: 'asc' | 'desc' }` state. `SortHeader` toggles direction on click. Sorted array derived with `useMemo`. On `<th>`, set `aria-sort` (`ascending` | `descending` | `none`) to reflect the active column.

### Detail drawer

Side drawer preferred over modal — doesn't block the table. Reads `?coin` from URL. Closes by clearing the param. Fetches coin detail + market chart in parallel (two separate `useQuery` calls that fire simultaneously). Rate-limit mitigation: see §6.

### Accessibility

- **Sortable headers:** Spec requires a keyboard-navigable table—not only rows. Use a focusable control per sortable column, e.g. `<button type="button">` inside `<th>` (or an equivalent pattern with proper role and keyboard handling), so users can Tab to headers and activate sort with Enter/Space.
- **Rows:** keyboard-navigable with `tabIndex`, `onKeyDown` Enter (or Space) to open drawer
- **Drawer:** focus trap, `Escape` closes, `role="dialog"`
- **Color:** 24h % change uses color + icon (not color alone) for WCAG AA

---

## 8. What to NOT over-engineer

- No Redux / Zustand — React Query + useState is enough
- No custom fetch layer beyond a thin typed wrapper
- No SSR — plain Vite SPA is fine, Vercel deploys it trivially
- No pagination — spec says top 20, keep it flat

---

## 9. README outline

Align `README.md` with the challenge deliverable so implementation does not drift:

- **How to run locally** — prerequisites (Node version), `npm install`, `npm run dev`, `npm test`, any env vars (none expected for public CoinGecko).
- **Main technical decisions** — one paragraph: stack (Vite, React, TS, TanStack Query, Tailwind, chart lib), URL param for detail, why minimal global state, how refresh and caching work.
- **AI usage** — one paragraph: which tools, how you prompted and reviewed output, what you corrected (types, a11y, error handling, etc.).

Optional: link to a Vercel/Netlify deploy if you add one.

---

## 10. Open decisions (to resolve before implementation)

- Drawer vs modal for the detail panel?
- Include Zod for runtime API validation?
- Sparkline stroke color — **decided:** tie to **24h %** (or neutral stroke); see §7 Sparkline.
- Folder structure: by type (current) or by feature (`features/market/`, `features/detail/`)?





Favorites / Watchlist  
  
