/** CoinGecko API shapes — no `any`. Optional fields match real response quirks (DESIGN §3). */

export interface SparklineData {
  price: number[]
}

export interface CoinMarket {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  price_change_percentage_24h: number | null
  /** Present when `sparkline=true` on markets call; omit if API drops it. */
  sparkline_in_7d?: SparklineData
}

export interface CoinDetail {
  id: string
  name: string
  symbol: string
  /** CoinGecko may use string URL or nested sizes; UI should use fallbacks. */
  image?: string | { large?: string; small?: string; thumb?: string }
  market_data?: {
    current_price?: { usd?: number | null }
    /** Present on full coin response; optional in typings. */
    price_change_percentage_24h?: number | null
    ath?: { usd?: number | null }
    ath_date?: { usd?: string | null }
    atl?: { usd?: number | null }
    atl_date?: { usd?: string | null }
  }
  /** `description.en` may be missing or empty. */
  description?: { en?: string }
}

export interface MarketChart {
  /** `[timestamp_ms, price]` */
  prices: [number, number][]
}
