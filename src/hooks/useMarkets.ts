import { useQuery } from '@tanstack/react-query'
import { fetchMarkets } from '../api/coingecko'

export function useMarkets() {
  return useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
    refetchInterval: 60_000,
  })
}
