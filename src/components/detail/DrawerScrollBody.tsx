import type { ReactNode } from 'react'
import type { CoinDetail } from '../../api/types'
import { CoinDescription } from './CoinDescription'
import { CoinDetailSummary } from './CoinDetailSummary'
import { PriceChart } from './PriceChart'
import { SkeletonDetail } from './SkeletonDetail'

export type DrawerScrollBodyProps = {
  isPending: boolean
  isError: boolean
  data: CoinDetail | undefined
  coinId: string
  onRetry: () => void
  children?: ReactNode
}

export function DrawerScrollBody({
  isPending,
  isError,
  data,
  coinId,
  onRetry,
  children,
}: DrawerScrollBodyProps) {
  if (isPending) {
    return <SkeletonDetail />
  }
  if (isError) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        role="alert"
      >
        <p className="font-medium">Couldn’t load asset details.</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-red-900 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    )
  }
  if (data) {
    return (
      <>
        <CoinDetailSummary detail={data} />
        <PriceChart coinId={coinId} />
        <CoinDescription
          coinId={coinId}
          descriptionEn={data.description?.en}
        />
        {children}
      </>
    )
  }
  return null
}
