import { useCallback, useEffect, useState } from 'react'
import { getCoinIdFromSearch, hrefWithCoinParam } from '../utils/coinSearchParam'

export type CoinSearchNavMode = 'push' | 'replace'

/**
 * Syncs selected coin id with `?coin=` (FR-4.7). Listens to `popstate` for back/forward.
 */
export function useCoinSearchParam() {
  const [coinId, setCoinIdState] = useState<string | null>(() =>
    getCoinIdFromSearch(window.location.search),
  )

  useEffect(() => {
    const onPopState = () => {
      setCoinIdState(getCoinIdFromSearch(window.location.search))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setCoinId = useCallback(
    (id: string | null, mode: CoinSearchNavMode = 'push') => {
      const path =
        hrefWithCoinParam(
          window.location.pathname,
          window.location.search,
          id,
        ) + window.location.hash
      if (mode === 'push') window.history.pushState(null, '', path)
      else window.history.replaceState(null, '', path)
      setCoinIdState(id)
    },
    [],
  )

  return { coinId, setCoinId }
}
