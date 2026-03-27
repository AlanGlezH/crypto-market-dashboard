import type { RefObject } from 'react'
import type { CoinDetail } from '../../api/types'
import { getCoinImageSrc } from '../../utils/coinDetailDisplay'

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

export function DrawerHeaderAsset({
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
    <div className="flex shrink-0 items-center gap-3 border-b border-slate-200/90 px-5 py-4">
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
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-slate-400"
        aria-label="Close"
      >
        <DrawerCloseIcon />
      </button>
    </div>
  )
}

export function DrawerHeaderPlaceholder({
  titleId,
  closeRef,
  onClose,
}: {
  titleId: string
  closeRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 px-5 py-4">
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
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-slate-400"
        aria-label="Close"
      >
        <DrawerCloseIcon />
      </button>
    </div>
  )
}
