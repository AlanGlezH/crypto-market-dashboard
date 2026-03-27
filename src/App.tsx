import type { CoinMarket } from './api/types'
import { DetailDrawer } from './components/detail/DetailDrawer'
import { MarketTable } from './components/table/MarketTable'
import {
  captureSelectedMarketRow,
  restoreMarketRowFocus,
} from './utils/restoreMarketRowFocus'
import { SkeletonTable } from './components/table/SkeletonTable'
import { ErrorBanner } from './components/shared/ErrorBanner'
import {
  getMarketsErrorDisplay,
  type MarketsErrorDisplay,
} from './constants/marketsErrors'
import { useCoinSearchParam } from './hooks/useCoinSearchParam'
import { useMarkets } from './hooks/useMarkets'

type MarketContentProps = {
  errorDisplay: MarketsErrorDisplay | null
  isPending: boolean
  coins: CoinMarket[]
  selectedCoinId: string | null
  onMarketsRetry: () => void
  onSelectCoin: (id: string) => void
}

function MarketContent({
  errorDisplay,
  isPending,
  coins,
  selectedCoinId,
  onMarketsRetry,
  onSelectCoin,
}: MarketContentProps) {
  if (errorDisplay) {
    return (
      <div className="flex min-h-[min(520px,calc(100vh-12rem))] flex-1 items-center justify-center py-10">
        <ErrorBanner
          message={errorDisplay.message}
          variant={errorDisplay.variant}
          metaLeft={errorDisplay.metaLeft}
          onRetry={onMarketsRetry}
        />
      </div>
    )
  }
  if (isPending) {
    return <SkeletonTable />
  }
  return (
    <MarketTable
      coins={coins}
      selectedCoinId={selectedCoinId}
      onSelectCoin={onSelectCoin}
    />
  )
}

function App() {
  const { data, isError, error, refetch, isPending } = useMarkets()
  const { coinId, setCoinId } = useCoinSearchParam()

  const errorDisplay = isError ? getMarketsErrorDisplay(error) : null

  /** URL `?coin=` may reference an id outside the current page; derive selection without mutating history. */
  const selectedCoinId =
    coinId && data?.some((c) => c.id === coinId) ? coinId : null

  function handleMarketsRetry() {
    refetch()
  }

  function handleSelectCoin(id: string) {
    setCoinId(id)
  }

  function handleCloseDrawer() {
    const row = captureSelectedMarketRow()
    setCoinId(null)
    restoreMarketRowFocus(row)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Clara Crypto Market Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Top 20 by market cap (USD)
        </p>
      </header>
      <main
        className="flex flex-1 flex-col p-6"
        inert={selectedCoinId != null}
      >
        <MarketContent
          errorDisplay={errorDisplay}
          isPending={isPending}
          coins={data ?? []}
          selectedCoinId={selectedCoinId}
          onMarketsRetry={handleMarketsRetry}
          onSelectCoin={handleSelectCoin}
        />
      </main>
      {selectedCoinId ? (
        <DetailDrawer
          coinId={selectedCoinId}
          onClose={handleCloseDrawer}
        />
      ) : null}
    </div>
  )
}

export default App
