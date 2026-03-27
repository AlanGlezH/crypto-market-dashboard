export type ErrorBannerVariant = 'generic' | 'rate-limit'

export type ErrorBannerProps = {
  message: string
  onRetry: () => void
  /** `rate-limit` uses calmer styling for 429-style errors (FR-5.1). */
  variant?: ErrorBannerVariant
}

export function ErrorBanner({
  message,
  onRetry,
  variant = 'generic',
}: ErrorBannerProps) {
  const surface =
    variant === 'rate-limit'
      ? 'border-amber-200 bg-amber-50 text-amber-950'
      : 'border-red-200 bg-red-50 text-red-950'

  return (
    <div
      role="alert"
      className={`mb-4 rounded-lg border px-4 py-3 shadow-sm ${surface}`}
    >
      <p className="text-sm leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        Retry
      </button>
    </div>
  )
}
