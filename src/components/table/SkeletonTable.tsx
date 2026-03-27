const COLUMN_LABELS = [
  'Rank',
  'Coin',
  'Price (USD)',
  '24h change',
  'Market cap',
  '7d trend',
] as const

const ROW_COUNT = 20

export function SkeletonTable() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading market data"
      className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {COLUMN_LABELS.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-slate-100 last:border-b-0"
            >
              {COLUMN_LABELS.map((label) => (
                <td
                  key={label}
                  className={`px-4 py-3 ${label === '7d trend' ? 'text-right' : ''}`}
                >
                  <div
                    className={
                      label === '7d trend'
                        ? 'inline-block h-10 w-[100px] shrink-0 animate-pulse rounded bg-slate-200'
                        : 'h-4 max-w-full animate-pulse rounded bg-slate-200'
                    }
                    style={
                      label === '7d trend'
                        ? undefined
                        : {
                            width:
                              label === 'Coin' ? '70%' : '55%',
                          }
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
