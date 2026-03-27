import { useQuery } from '@tanstack/react-query'
import { fetchMarketChart } from '../api/coingecko'

const CHART_STALE_MS = 5 * 60_000 // DESIGN §6 — align with detail cache

export function useMarketChart(id: string | null) {
  return useQuery({
    queryKey: ['coin', 'chart', id],
    queryFn: () => fetchMarketChart(id as string),
    enabled: Boolean(id),
    staleTime: CHART_STALE_MS,
  })
}
