import { useEffect, useId, useRef, type ReactNode } from 'react'

export type DetailDrawerProps = {
  /** Mount only when open (e.g. URL `?coin=` that matches loaded markets). */
  coinId: string
  onClose: () => void
  children?: ReactNode
}

/** Mount from the parent only when a coin is selected — effects run for an open drawer. */
export function DetailDrawer({ coinId, onClose, children }: DetailDrawerProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(function focusCloseButton() {
    closeRef.current?.focus()
  }, [coinId])

  useEffect(function subscribeEscapeToClose() {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 transition-opacity"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 id={titleId} className="truncate text-lg font-semibold text-slate-900">
            Asset details
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
          >
            Close
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {children ?? (
            <p className="text-sm text-slate-500">Details load in the next step.</p>
          )}
        </div>
      </div>
    </div>
  )
}
