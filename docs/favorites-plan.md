# Favorites feature — implementation plan

Reference: [favorites-feature.md](./favorites-feature.md) (design), [DESIGN.md](./DESIGN.md), [REQUIREMENTS.md](./REQUIREMENTS.md).

---

## Step 0 — Storage helper: `src/utils/favoritesStorage.ts` (new file)

Pure module, no React. Owns the `localStorage` key and all read/write/validation logic.

**Exports:**

```ts
const STORAGE_KEY = 'crypto-market-dashboard:favorite-ids'

/** Read + validate + dedupe from localStorage. Returns [] on any failure. */
function loadFavoriteIds(): string[]

/** Persist the full array (JSON). Silently swallows quota/security errors. */
function saveFavoriteIds(ids: string[]): void
```

**Rules:**

- `loadFavoriteIds` → `JSON.parse`, then `Array.isArray` guard, filter to `typeof === 'string'` and non-empty, dedupe via `Set`. Any parse failure or invalid shape → `[]`.
- `saveFavoriteIds` → `try { localStorage.setItem(…) } catch { /* silent */ }`. log errors.
- Export `STORAGE_KEY` for tests only (or keep it private and test through the public helpers).

**Tests → `src/utils/__tests__/favoritesStorage.test.ts`:**

```ts
describe('favoritesStorage', () => {
  it('round-trips a valid array through save → load', () => {
    saveFavoriteIds(['bitcoin', 'ethereum'])
    expect(loadFavoriteIds()).toEqual(['bitcoin', 'ethereum'])
  })

  it('returns [] when storage contains non-array JSON', () => {
    localStorage.setItem(STORAGE_KEY, '"hello"')
    expect(loadFavoriteIds()).toEqual([])
  })

  it('filters out non-string entries', () => {
    localStorage.setItem(STORAGE_KEY, '["bitcoin", 42, null, "ethereum"]')
    expect(loadFavoriteIds()).toEqual(['bitcoin', 'ethereum'])
  })

  it('dedupes repeated ids', () => {
    localStorage.setItem(STORAGE_KEY, '["bitcoin", "bitcoin"]')
    expect(loadFavoriteIds()).toEqual(['bitcoin'])
  })

  it('does not throw when localStorage.setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError')
    })
    expect(() => saveFavoriteIds(['bitcoin'])).not.toThrow()
  })
})
```

---

## Step 1 — Hook: `src/hooks/useFavoriteIds.ts` (new file)

Thin React hook over the storage module.

**Signature:**

```ts
function useFavoriteIds(): {
  favoriteIds: ReadonlySet<string>
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
}
```

**Implementation notes:**

- `useState<Set<string>>` with a **lazy initializer** that calls `loadFavoriteIds()` and wraps in a `Set`.
- `toggleFavorite` computes the next `Set` (add or delete), calls `saveFavoriteIds([...nextSet])`, then sets state.
- `isFavorite` is a convenience: `favoriteIds.has(id)`. Could be inline in consumers, but keeps the API symmetric.
- No context provider, no reducer, no external state library.

**Tests → `src/hooks/__tests__/useFavoriteIds.test.ts`:**

Simple `renderHook` tests — validate toggle round-trip and persistence, nothing more.

```ts
describe('useFavoriteIds', () => {
  it('starts empty when localStorage has no entry', () => {
    const { result } = renderHook(() => useFavoriteIds())
    expect(result.current.favoriteIds.size).toBe(0)
  })

  it('toggleFavorite adds and removes an id', () => {
    const { result } = renderHook(() => useFavoriteIds())

    act(() => result.current.toggleFavorite('bitcoin'))
    expect(result.current.isFavorite('bitcoin')).toBe(true)

    act(() => result.current.toggleFavorite('bitcoin'))
    expect(result.current.isFavorite('bitcoin')).toBe(false)
  })

  it('persists to localStorage so a new hook instance reads them back', () => {
    const { result: first } = renderHook(() => useFavoriteIds())
    act(() => first.current.toggleFavorite('ethereum'))

    const { result: second } = renderHook(() => useFavoriteIds())
    expect(second.current.isFavorite('ethereum')).toBe(true)
  })
})
```

---

## Step 2 — Partition utility: `src/utils/partitionFavorites.ts` (new file)

Pure function, easy to unit-test.

```ts
function partitionFavorites<T extends { id: string }>(
  items: T[],
  favoriteIds: ReadonlySet<string>,
): T[]
```

Returns a **new array**: items whose `id` is in `favoriteIds` first (preserving relative order), then the rest (preserving relative order).

**Tests → `src/utils/__tests__/partitionFavorites.test.ts`:**

Reuses the `CoinMarket` fixture style from the existing sort tests.

```ts
const A = { id: 'a' } as CoinMarket
const B = { id: 'b' } as CoinMarket
const C = { id: 'c' } as CoinMarket

describe('partitionFavorites', () => {
  it('returns same order when no favorites', () => {
    expect(partitionFavorites([A, B, C], new Set())).toEqual([A, B, C])
  })

  it('returns same order when all are favorites', () => {
    expect(partitionFavorites([A, B, C], new Set(['a', 'b', 'c']))).toEqual([A, B, C])
  })

  it('moves favorites first, preserves relative order in each group', () => {
    expect(partitionFavorites([A, B, C], new Set(['c', 'a']))).toEqual([A, C, B])
  })

  it('returns [] for empty input', () => {
    expect(partitionFavorites([], new Set(['a']))).toEqual([])
  })
})
```

---

## Step 3 — Star button: `src/components/table/FavoriteStar.tsx` (new file)

Small presentational component.

```tsx
type FavoriteStarProps = {
  coinName: string
  active: boolean
  onToggle: () => void
}
```

- Renders a `<button type="button">` with an inline SVG star (outline when `active=false`, filled when `active=true`).
- `aria-pressed={active}`, `aria-label` includes `coinName` (e.g. "Add Bitcoin to favorites" / "Remove Bitcoin from favorites").
- Calls `onToggle` on click. Calls `e.stopPropagation()` so the row's `onClick` (open drawer) is **not** triggered.
- Tailwind only, match existing color palette (`text-amber-400` filled, `text-slate-300` outline, hover states).
- Compact sizing so it fits a narrow first column.

**Tests → `src/components/table/__tests__/FavoriteStar.test.tsx`:**

Minimal: verify toggle fires, click does not propagate, and a11y attributes are correct.

```ts
describe('FavoriteStar', () => {
  it('calls onToggle on click', () => {
    const toggle = vi.fn()
    render(<FavoriteStar coinName="Bitcoin" active={false} onToggle={toggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledOnce()
  })

  it('does not propagate click to parent', () => {
    const parent = vi.fn()
    render(
      <div onClick={parent}>
        <FavoriteStar coinName="Bitcoin" active={false} onToggle={vi.fn()} />
      </div>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(parent).not.toHaveBeenCalled()
  })

  it('sets aria-pressed matching active prop', () => {
    const { rerender } = render(
      <FavoriteStar coinName="Bitcoin" active={false} onToggle={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<FavoriteStar coinName="Bitcoin" active={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
```

---

## Step 4 — Wire into `MarketTable.tsx` (existing file)

This is the main integration step. **No additional tests** — the behavior is covered by the unit tests in steps 0–3 (storage, hook, partition, star button). The manual checklist in step 6 covers end-to-end wiring.

Changes:

### 4a. Consume hook

```ts
import { useFavoriteIds } from '../../hooks/useFavoriteIds'
import { partitionFavorites } from '../../utils/partitionFavorites'
```

Call `useFavoriteIds()` at the top of `MarketTable`.

### 4b. New `useMemo` — `displayCoins`

After the existing `sortedCoins` memo, add:

```ts
const displayCoins = useMemo(
  () => partitionFavorites(sortedCoins, favoriteIds),
  [sortedCoins, favoriteIds],
)
```

Replace `sortedCoins` with `displayCoins` in the `<tbody>` map.

### 4c. Add favorite column to `MARKET_TABLE_COLUMNS`

Prepend a narrow non-sortable column. Two options:

- **Option A (preferred):** Add a plain `<th>` with a visually hidden label ("Favorites") **outside** the `.map` of `MARKET_TABLE_COLUMNS` so it does not go through `SortHeader`. Keeps the array typed for sortable columns only.
- Go with **Option A** — add a single `<th scope="col" className="w-10 ..."><span className="sr-only">Favorites</span></th>` before the `.map`.

### 4d. Pass star props to row

`MarketTableRow` receives `isFavorite` (boolean) and `onToggleFavorite` callback. It forwards them to the row.

### 4e. Render `FavoriteStar` in the row

In `TableRow.tsx` (existing file):

- Add new props: `isFavorite: boolean` and `onToggleFavorite?: () => void`.
- Insert a new `<td>` as the **first cell** (before rank) containing `<FavoriteStar>`.
- If `onToggleFavorite` is not provided, render a disabled/hidden star or skip (same pattern as `onActivate`).

---

## Step 5 — Update `SkeletonTable.tsx` (existing file)

Add a narrow empty first column to `COLUMN_LABELS` (or prepend a `<th>` / `<td>` outside the map) so skeleton rows have the same column count as the real table.

---

## Step 6 — Manual verification checklist

After implementation, verify:

- Clicking star toggles fill; does **not** open drawer.
- Starred coins float to top; unstarred remain in current sort order.
- Refresh page: stars are preserved, pinned order restored.
- Clear `localStorage` key manually → stars disappear on next load; no errors.
- Put garbage in storage key → treated as empty; no errors.
- Search filters both starred and unstarred; starred matches still appear first.
- Sort change reorders within starred/unstarred blocks independently.
- Keyboard: Tab reaches star button; Enter/Space toggles it; row activation still works.
- Screen reader: star button announces state and coin name.

---

## File change summary


| File                                             | Action                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| `src/utils/favoritesStorage.ts`                  | **Create** — localStorage read/write/validate           |
| `src/utils/__tests__/favoritesStorage.test.ts`   | **Create** — unit tests for storage                     |
| `src/hooks/useFavoriteIds.ts`                    | **Create** — React hook                                 |
| `src/utils/partitionFavorites.ts`                | **Create** — pure partition function                    |
| `src/utils/__tests__/partitionFavorites.test.ts` | **Create** — unit tests for partition                   |
| `src/components/table/FavoriteStar.tsx`          | **Create** — star button component                      |
| `src/components/table/MarketTable.tsx`           | **Edit** — hook + displayCoins + favorite column header |
| `src/components/table/TableRow.tsx`              | **Edit** — new first `<td>` with `FavoriteStar`         |
| `src/components/table/SkeletonTable.tsx`         | **Edit** — match new column count                       |


**No new dependencies.** No new state library. No changes to API layer, React Query hooks, or routing.