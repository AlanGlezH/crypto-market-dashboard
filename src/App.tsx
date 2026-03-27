import { MarketTable } from './components/table/MarketTable'
import { SkeletonTable } from './components/table/SkeletonTable'
import { ErrorBanner } from './components/ui/ErrorBanner'
import { getMarketsErrorDisplay } from './constants/marketsErrors'
import { useMarkets } from './hooks/useMarkets'

function App() {
  const { data, isError, error, refetch, isPending } = useMarkets()

  const errorDisplay = isError ? getMarketsErrorDisplay(error) : null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Clara Market Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Top 20 by market cap (USD)
        </p>
      </header>
      <main className="flex-1 p-6">
        {errorDisplay ? (
          <ErrorBanner
            message={errorDisplay.message}
            variant={errorDisplay.variant}
            onRetry={() => {
              void refetch()
            }}
          />
        ) : isPending ? (
          <SkeletonTable />
        ) : (
          <MarketTable
            coins={data ?? []}
            onSelectCoin={() => {
              /* Detail drawer — Step 26 */
              console.log("onSelectCoin");
            }}
          />
        )}
      </main>
    </div>
  )
}

export default App
