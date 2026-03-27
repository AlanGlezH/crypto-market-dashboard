import { formatPercentage } from '../../utils/format'

export function Change24hInline({ pct }: { pct: number | null | undefined }) {
  if (pct == null || Number.isNaN(pct)) {
    return <span className="text-sm text-slate-500">—</span>
  }

  let toneClass: string
  let arrow: string
  if (pct > 0) {
    toneClass = 'text-emerald-700'
    arrow = '▲'
  } else if (pct < 0) {
    toneClass = 'text-red-700'
    arrow = '▼'
  } else {
    toneClass = 'text-slate-600'
    arrow = '—'
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-semibold tabular-nums ${toneClass}`}
    >
      <span aria-hidden="true" className="text-xs">
        {arrow}
      </span>
      <span>{formatPercentage(pct)}</span>
    </span>
  )
}
