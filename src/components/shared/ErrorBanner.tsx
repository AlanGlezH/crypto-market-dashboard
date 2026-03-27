export type ErrorBannerVariant = 'generic' | 'rate-limit'

export type ErrorBannerProps = {
  message: string
  onRetry: () => void
  /** `rate-limit` uses calmer styling for 429-style errors (FR-5.1). */
  variant?: ErrorBannerVariant
  title?: string
  metaLeft?: string
  /** Linked from the line below the card (e.g. provider status page). */
  statusPageUrl?: string
  statusPageLabel?: string
}

function MetaCapsule({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500"
        aria-hidden
      />
      {label}
    </span>
  )
}

export function ErrorBanner({
  message,
  onRetry,
  variant = 'generic',
  title = 'Connection Interrupted',
  metaLeft = 'SYSTEM API ERR',
  statusPageUrl = 'https://status.coingecko.com/',
  statusPageLabel = 'System Status',
}: ErrorBannerProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div
        role="alert"
        data-variant={variant}
        className="w-full rounded-2xl bg-white px-8 py-9 text-center shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/80"
      >
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 w-full max-w-[200px] rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Retry
        </button>
        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-center justify-center">
            <MetaCapsule label={metaLeft} />
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-sm text-center text-xs text-slate-500">
        Check our{' '}
        <a
          href={statusPageUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-700 hover:decoration-blue-700/50"
        >
          {statusPageLabel}
        </a>{' '}
        for live updates.
      </p>
    </div>
  )
}
