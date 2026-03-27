/** Loading placeholder mirroring coin summary layout (DESIGN §6). */
export function SkeletonDetail() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading asset details"
      className="space-y-6"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2 pt-1">
          <div
            className="h-6 max-w-[200px] animate-pulse rounded bg-slate-200"
            style={{ width: '60%' }}
          />
          <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-full max-w-xs animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-full max-w-xs animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
