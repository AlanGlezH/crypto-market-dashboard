# Functional requirements — Crypto Market Dashboard

Implementation and self-review checklist. IDs are stable for traceability to the employer brief, [DESIGN.md](./DESIGN.md), and [PLAN.md](./PLAN.md) (implementation order). UI mockups: [design/](./design/).

---

## FR-1 — Market data (overview)


| ID         | Requirement                                                                                                                                                                            | Acceptance (done when)                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **FR-1.1** | Load top **20** coins by market cap in **USD** using CoinGecko `GET /api/v3/coins/markets` with `vs_currency=usd`, `order=market_cap_desc`, `per_page=20`, `page=1`, `sparkline=true`. | Table shows up to 20 rows when the API succeeds.        |
| **FR-1.2** | Data **refetches every 60 seconds** without full page reload.                                                                                                                          | Periodic refetch occurs; UI updates without navigation. |
| **FR-1.3** | While the markets request is in flight (initial or refetch), show a **skeleton** for the table (or equivalent loading UI).                                                             | No blank flash; skeleton mirrors table layout.          |


---

## FR-2 — Market table columns


| ID         | Requirement                                                                                                                     | Acceptance                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **FR-2.1** | **Rank** from `market_cap_rank`.                                                                                                | Visible per row.                                                       |
| **FR-2.2** | **Name + icon** from `name` and `image`.                                                                                        | Icon and name shown together.                                          |
| **FR-2.3** | **Current price** formatted as **USD**.                                                                                         | Consistent currency formatting (e.g. `$69,964` or locale-appropriate). |
| **FR-2.4** | **24h change %** from the API; **green** if positive, **red** if negative; **not color-only** (e.g. icon or text cue) for WCAG. | Correct sign and color; non-color cue present.                         |
| **FR-2.5** | **Market cap** human-readable (e.g. `$1.2T`, `$340B`).                                                                          | Matches spec intent.                                                   |
| **FR-2.6** | **7d sparkline** from `sparkline_in_7d.price` as a small inline chart.                                                          | Renders per row when data exists; degrades gracefully if missing.      |


---

## FR-3 — Table interaction


| ID         | Requirement                                                                                                                                                                                                 | Acceptance                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **FR-3.1** | **Client-side sort** on **every** column. For the sparkline column, define a sort key (e.g. last price in series) or document “no meaningful sort” if omitted.                                              | Sorting updates order without refetch.                              |
| **FR-3.2** | **Search/filter** by **name or symbol** in **real time** as the user types.                                                                                                                                 | Filtering is immediate; case-insensitive matching recommended.      |
| **FR-3.3** | **Empty search** shows an **empty state** message (not a silent empty table).                                                                                                                               | Clear copy when zero rows match.                                    |
| **FR-3.4** | **Keyboard:** table is **keyboard-navigable**; **sortable headers** are operable with keyboard (e.g. `<button type="button">` in `<th>`); **row** opens detail with **Enter** (and/or Space if documented). | Tab through headers and rows; sort and open detail without a mouse. |


---

## FR-4 — Asset detail (drawer)


| ID         | Requirement                                                                                                                            | Acceptance                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **FR-4.1** | Clicking a row opens a **side drawer** (per [DESIGN.md](./DESIGN.md)).                                                                 | Drawer visible; table remains in context on desktop.                      |
| **FR-4.2** | Detail loads via `GET /api/v3/coins/{id}` with `localization=false&tickers=false&community_data=false&developer_data=false`.           | Required fields below sourced from this response with null-safe handling. |
| **FR-4.3** | Show **name**, **logo**, **current price (USD)**, **all-time high + date**, **all-time low + date**.                                   | Sensible fallbacks when fields are missing.                               |
| **FR-4.4** | **7-day price chart** from `GET /api/v3/coins/{id}/market_chart` with `vs_currency=usd&days=7`.                                        | Chart renders from the `prices` series.                                   |
| **FR-4.5** | **Description:** first **~300 characters** with **Read more** / **Read less** (or equivalent).                                         | Truncation and toggle work.                                               |
| **FR-4.6** | Drawer **closes** via visible control and **Escape**; **focus management** and `role="dialog"` (or equivalent) per accessibility plan. | Focus is not stranded after close.                                        |
| **FR-4.7** | Selected asset reflected in the **URL** (e.g. `?coin=bitcoin`); reload restores selection.                                             | Shareable / bookmarkable detail state.                                    |


---

## FR-5 — Errors and rate limits


| ID         | Requirement                                                                                              | Acceptance                                           |
| ---------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **FR-5.1** | **429 / rate limit** handled with a **clear message** and **Retry**; no aggressive automatic retry loop. | User understands the limit and can retry explicitly. |
| **FR-5.2** | Other failures show a **user-friendly error** and **Retry** where appropriate.                           | App does not white-screen on fetch errors.           |


---

## FR-6 — Technical constraints (employer brief)


| ID         | Requirement                                                                                      | Acceptance                                                 |
| ---------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| **FR-6.1** | **React:** functional components and hooks only.                                                 | No class components.                                       |
| **FR-6.2** | **TypeScript:** API responses **typed**; **no `any`** for API-shaped data.                       | Types cover fetch results.                                 |
| **FR-6.3** | **Data fetching:** **TanStack Query** or **SWR** for server state.                               | Markets, detail, and chart queries use the chosen library. |
| **FR-6.4** | **State:** **minimal global state**; URL and local state per [DESIGN.md](./DESIGN.md).           | No unnecessary global store.                               |
| **FR-6.5** | **Styling:** **Tailwind CSS** preferred (CSS Modules or Styled Components acceptable per brief). | Coherent spacing, typography, and color.                   |
| **FR-6.6** | **Contrast** meets **WCAG AA** for text and interactive controls.                                | Spot-check critical UI.                                    |


---

## FR-7 — Deliverable


| ID         | Requirement                                                                                                                    | Acceptance                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- |
| **FR-7.1** | **README.md** includes: how to run locally; **one paragraph** on main technical decisions; **one paragraph** on AI tool usage. | Matches employer deliverable. |


---

## Design-aligned notes (non-functional)

These support [DESIGN.md](./DESIGN.md) but are not duplicated as hard employer requirements.


| ID            | Note                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| **NFR-DES-1** | Sparkline stroke color follows **24h %** (or use a **neutral** stroke); see DESIGN §7.                   |
| **NFR-DES-2** | Handle optional / variable API fields (e.g. `description.en`, `image`) without runtime errors.           |
| **NFR-DES-3** | Start with **by-type** folder layout; revisit **by-feature** only after MVP if structure becomes a pain. |


Optional: deployment link (Vercel / Netlify) is a plus, not required.