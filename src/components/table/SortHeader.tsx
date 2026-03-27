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
  let ariaSort: 'ascending' | 'descending' | 'none' = 'none'
  if (active) {
    ariaSort = direction === 'asc' ? 'ascending' : 'descending'
  }

  function handleSortClick() {
    onSort(column)
  }

  return (
    <th scope="col" aria-sort={ariaSort} className="p-0">
      <button
        type="button"
        onClick={handleSortClick}
        className={`group flex w-full min-w-0 cursor-pointer items-center gap-1 px-4 py-3 ${HEADER_TEXT} hover:bg-slate-200/80 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${align === 'end' ? 'justify-end' : 'justify-start'}`}
      >
        <span>{label}</span>
        {active ? (
          <span className="text-[0.65rem] text-slate-500" aria-hidden="true">
            {direction === 'asc' ? '▲' : '▼'}
          </span>
        ) : null}
      </button>
    </th>
  )
}
