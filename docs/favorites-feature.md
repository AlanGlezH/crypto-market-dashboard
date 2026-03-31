# Favorites (starred assets) — feature design

Draft for review. Aligns with [DESIGN.md](./DESIGN.md) (minimal global state, React Query for server data) and extends the market table behavior.

---

## 1. Goal

- Add a **star control** on each market table row.
- **Starred** rows appear **pinned above** all non-starred rows.
- Favorites **persist across full page reloads** (and browser restarts) on the same origin.

Non-goals for this iteration:

- Sync across devices or browsers (no account, no backend).
- Showing starred coins that are **not** in the current markets response (e.g. fell out of the top 20). Those ids can remain in storage for a future “watchlist” view; the table only renders rows for coins returned by the API.

---

## 2. UX and behavior

### 2.1 Star control

- **Placement (decided):** Add the star in the **first column**, before rank—this matches common “pin / favorite” table patterns and keeps the control easy to scan.
- **Filled** vs **outline** star (or equivalent) for on/off. Use Tailwind and existing icon approach in the repo (inline SVG or small component).
- **Click / Enter / Space** on the star toggles favorite state. **Do not** open the detail drawer when activating the star (`stopPropagation` / separate focus target), so the star and row remain distinct actions.
- **Accessibility:** `aria-pressed` on a `button type="button"`, and an accessible name that reflects state, e.g. “Add Bitcoin to favorites” / “Remove Bitcoin from favorites” (use `coin.name`).

### 2.2 Pinning order

After the existing pipeline **search filter → column sort** (see `MarketTable` + `sortCoins`):

1. Compute `sortedCoins` exactly as today from `filteredCoins`.
2. **Partition** into `[starred, unstarred]` where membership is by `coin.id` (CoinGecko id, stable for storage).
3. Concatenate: `displayCoins = [...starred, ...unstarred]`.
4. **Within** each group, order matches the active sort column and direction. That way pinning does not fight the user’s sort; it only lifts favorites as a block.

**Search:** If the user searches and a starred coin matches, it still appears in the starred block at the top of the filtered result. Starred coins that do not match the search string do not appear (same as today for any non-matching row).

**Visual separation (decided):** No extra divider or spacing between the starred block and the rest of the rows—keep one continuous table unless user testing suggests otherwise.

### 2.3 Edge cases


| Case                                        | Behavior                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API returns fewer than 20 rows              | Unchanged; favorites only affect order among returned rows.                                                                                                                                 |
| Favorite id not in current payload          | Id stays in `localStorage`; no ghost row in the table.                                                                                                                                      |
| `localStorage` throws (private mode, quota) | Degrade gracefully: favorites work for the session in memory only, or show a one-time subtle notice—pick one policy in implementation; prefer **silent in-memory fallback** to avoid noise. |
| Corrupt / invalid stored value              | On read, treat as empty set; optional one-time overwrite with `[]` to heal storage.                                                                                                         |


---

## 3. Persistence: `localStorage`

### 3.1 What to store

- **Only** a list of **coin ids** (`string[]`), e.g. `["bitcoin", "ethereum"]`.
- Do **not** store full `CoinMarket` objects: they go stale (prices, rank). The API remains the source of truth for row data; favorites are **references** by id.

### 3.2 Key and format

- Use a **namespaced** key to avoid collisions, e.g. `crypto-market-dashboard:favorite-ids`.
- Serialize as **JSON** (`JSON.stringify` / `JSON.parse`) for a simple, inspectable array.

### 3.3 Read / write rules

- **Read once** when the hook/provider initializes (see §4), into React state.
- **Write** on each toggle: update state, then persist. Debouncing is unnecessary at human click rates; optional micro-debounce if you batch future features.
- **Validate** after parse: `Array.isArray` and every element `typeof id === 'string'`; **dedupe**; ignore empty strings. Invalid payload → empty favorites.

---

## 4. Derived state vs stored state


| Kind                                       | What it is                                                      | Where it lives                                 |
| ------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------- |
| **Stored (authoritative for persistence)** | Set/list of favorite **ids**                                    | `localStorage` + in-memory copy in React       |
| **Server state**                           | Market rows                                                     | React Query (unchanged)                        |
| **Ephemeral UI**                           | Search query, sort column/direction                             | `useState` in `MarketTable` (unchanged)        |
| **Derived**                                | `displayCoins` — filtered, sorted, then starred-first partition | `useMemo` from `sortedCoins` + favorite id set |


**Rule:** Never persist `displayCoins` or sorted order. Those are always recomputed from API data + UI sort + favorite ids.

**`isFavorite(coinId)`** is derived: `favoriteIds.has(coinId)` — not a separate boolean stored per row.

---

## 5. State manager: do you need one?

**No.** Same rationale as [DESIGN.md §8](./DESIGN.md): no Redux / Zustand for this feature.

- Favorite ids are **client preferences**, not shared server state—TanStack Query does not apply.
- A small `useFavoriteIds` hook that returns `{ favoriteIds, toggleFavorite, isFavorite }` is enough.
- **Keep it simple:** no extra layers unless prop drilling or reuse forces a thin context provider—still not Redux/Zustand.
- Reach for a state manager only if multiple unrelated subtrees need favorites **and** prop drilling becomes painful; that is unlikely in this app’s size.

---

## 6. Suggested implementation shape (non-binding)

1. **Persistence vs UI (optional split, still simple):** If it stays clearer, use **two small pieces** instead of one fat hook:
   - **`favoritesStorage.ts` (or `useFavoriteStorage`):** read/write `localStorage`, parse/validate/dedupe, return stable helpers. Lazy read on init; write after mutations.
   - **`useFavoriteIds`:** holds the in-memory `Set` (or array) + `toggleFavorite` / `isFavorite`, calls the storage module. All “business rules” for what counts as a favorite id live here or in the storage module—not in the table cell.
   - If the app stays tiny, a **single** `useFavoriteIds.ts` that inlines storage is fine; split only when tests or readability benefit.
2. **`src/components/table/…`**
   - New first column / cell: `FavoriteStar` button.
   - `MarketTable`: consume the hook, compute `displayCoins` in `useMemo` after `sortedCoins`.
3. **Tests**
   - Unit-test partition logic (pure function): given `sortedIds` and `favoriteIds`, output order is correct.
   - Optional: storage parse/validate edge cases.

---

## 7. Open choices for implementation

- **Column header:** Add a narrow “Favorites” (or unlabeled) column vs embedding only in the rank/coin cell—prefer a dedicated narrow column for layout consistency.
- **Constants:** Export storage key from one module to avoid typos.

---

## 8. Requirements traceability (suggested)

When you promote this to [REQUIREMENTS.md](./REQUIREMENTS.md), consider a small **FR-3.x** block: star toggle, pin behavior, persistence, and a11y on the control.