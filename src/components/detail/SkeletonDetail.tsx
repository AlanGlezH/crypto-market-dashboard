export function SkeletonDetail() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading asset details"
      className="space-y-8"
    >
      <div className="space-y-2">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="h-11 w-44 animate-pulse rounded-md bg-slate-200" />
          <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-200" />
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-6 w-24 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}
