import type { MarketSortColumn, SortDirection } from '../../utils/sort'

const HEADER_TEXT =
  'text-xs font-semibold uppercase tracking-wide text-slate-500'

export type SortHeaderProps = {
  label: string
  column: MarketSortColumn
  activeColumn: MarketSortColumn
  direction: SortDirection
  align: 'start' | 'end'
  onSort: (column: MarketSortColumn) => void
}

export function SortHeader({
  label,
  column,
  activeColumn,
  direction,
  align,
  onSort,
}: SortHeaderProps) {
  const active = column === activeColumn
  const ariaSort = active
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none'

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`px-4 py-3 ${HEADER_TEXT} ${align === 'end' ? 'text-right' : 'text-left'}`}
    >
      <button
        type="button"
        onClick={() => {
          onSort(column)
        }}
        className={`group -mx-1 -my-0.5 flex w-full min-w-0 items-center gap-1 rounded px-1 py-0.5 ${HEADER_TEXT} hover:bg-slate-200/80 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${align === 'end' ? 'justify-end' : 'justify-start'}`}
      >
        <span>{label}</span>
        {active ? (
          <span className="text-[0.65rem] text-slate-400" aria-hidden="true">
            {direction === 'asc' ? '▲' : '▼'}
          </span>
        ) : null}
      </button>
    </th>
  )
}
