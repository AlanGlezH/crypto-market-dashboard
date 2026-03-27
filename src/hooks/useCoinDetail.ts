import { useQuery } from '@tanstack/react-query'
import { fetchCoinDetail } from '../api/coingecko'

const DETAIL_STALE_MS = 5 * 60_000 // DESIGN §6 (~5 min)

export function useCoinDetail(id: string | null) {
  return useQuery({
    queryKey: ['coin', 'detail', id],
    queryFn: () => fetchCoinDetail(id as string),
    enabled: !!id ,
    staleTime: DETAIL_STALE_MS,
  })
}
