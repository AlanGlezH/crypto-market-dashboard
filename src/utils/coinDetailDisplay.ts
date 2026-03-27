import type { CoinDetail } from '../api/types'

/** Resolve a usable image URL from CoinGecko’s variable `image` field. */
export function getCoinImageSrc(image: CoinDetail['image']): string | undefined {
  if (image == null) {
    return undefined
  }
  if (typeof image === 'string') {
    return image
  }
  return image.large ?? image.small ?? image.thumb
}
