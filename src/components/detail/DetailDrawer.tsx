import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from 'react'
import { useCoinDetail } from '../../hooks/useCoinDetail'
import { useDrawerFocusTrap } from '../../hooks/useDrawerFocusTrap'
import {
  DrawerHeaderAsset,
  DrawerHeaderPlaceholder,
} from './DetailDrawerHeader'
import { DrawerScrollBody } from './DrawerScrollBody'

export type DetailDrawerProps = {
  coinId: string
  onClose: () => void
  children?: ReactNode
}

export function DetailDrawer({ coinId, onClose, children }: DetailDrawerProps) {
  const titleId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, isPending, isError, refetch } = useCoinDetail(coinId)

  function handleRetryDetail() {
    void refetch()
  }

  useDrawerFocusTrap(panelRef)

  useLayoutEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
  }, [coinId, data, isPending, isError])

  useEffect(function subscribeEscapeToClose() {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 cursor-pointer bg-slate-900/45 backdrop-blur-[2px] transition-opacity"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
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
          <DrawerScrollBody
            isPending={isPending}
            isError={isError}
            data={data}
            coinId={coinId}
            onRetry={handleRetryDetail}
          >
            {children}
          </DrawerScrollBody>
        </div>
      </div>
    </div>
  )
}
