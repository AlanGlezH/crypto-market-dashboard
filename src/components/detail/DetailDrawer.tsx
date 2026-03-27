import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react'
import type { CoinDetail } from '../../api/types'
import { useCoinDetail } from '../../hooks/useCoinDetail'
import { getCoinImageSrc } from '../../utils/coinDetailDisplay'
import { CoinDescription } from './CoinDescription'
import { CoinDetailSummary } from './CoinDetailSummary'
import { PriceChart } from './PriceChart'
import { SkeletonDetail } from './SkeletonDetail'

export type DetailDrawerProps = {
  /** Mount only when open (e.g. URL `?coin=` that matches loaded markets). */
  coinId: string
  onClose: () => void
  children?: ReactNode
}

function DrawerCloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

function DrawerHeaderAsset({
  detail,
  titleId,
  closeRef,
  onClose,
}: {
  detail: CoinDetail
  titleId: string
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  const imageSrc = getCoinImageSrc(detail.image)
  const symbol = detail.symbol?.toUpperCase() ?? '—'

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/90 px-5 py-4">
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-full border border-slate-100 bg-white object-cover shadow-sm"
        />
      ) : (
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-100 bg-slate-100 text-sm font-bold text-slate-600"
          aria-hidden
        >
          {(detail.name?.[0] ?? '?').toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2
          id={titleId}
          className="truncate text-xl font-bold tracking-tight text-[#1a1c21]"
        >
          {detail.name}
        </h2>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {symbol}
        </p>
      </div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        aria-label="Close"
      >
        <DrawerCloseIcon />
      </button>
    </header>
  )
}

function DrawerHeaderPlaceholder({
  titleId,
  closeRef,
  onClose,
}: {
  titleId: string
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 px-5 py-4">
      <h2
        id={titleId}
        className="truncate text-lg font-bold tracking-tight text-[#1a1c21]"
      >
        Asset details
      </h2>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        aria-label="Close"
      >
        <DrawerCloseIcon />
      </button>
    </header>
  )
}

/** Mount from the parent only when a coin is selected — effects run for an open drawer. */
export function DetailDrawer({ coinId, onClose, children }: DetailDrawerProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const { data, isPending, isError, refetch } = useCoinDetail(coinId)

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
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex h-full w-full max-w-[420px] flex-col border-l border-slate-200/80 bg-white shadow-[0_0_40px_rgba(15,23,42,0.12)]"
      >
        {data && !isPending && !isError ? (
          <DrawerHeaderAsset
            detail={data}
            titleId={titleId}
            closeRef={closeRef}
            onClose={onClose}
          />
        ) : (
          <DrawerHeaderPlaceholder
            titleId={titleId}
            closeRef={closeRef}
            onClose={onClose}
          />
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-5">
          {isPending ? (
            <SkeletonDetail />
          ) : isError ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
              role="alert"
            >
              <p className="font-medium">Couldn’t load asset details.</p>
              <button
                type="button"
                className="mt-3 rounded-lg bg-red-900 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                onClick={() => {
                  void refetch()
                }}
              >
                Retry
              </button>
            </div>
          ) : data ? (
            <>
              <CoinDetailSummary detail={data} />
              <PriceChart coinId={coinId} />
              <CoinDescription
                coinId={coinId}
                descriptionEn={data.description?.en}
              />
              {children}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
