/** ~300 characters per FR-4.5 / PLAN Step 24. */
export const COIN_DESCRIPTION_EXCERPT_MAX = 300

export type CoinDescriptionExcerpt = {
  excerpt: string
  full: string
  isExpandable: boolean
}

/** Plain string; caller should pass normalized text. */
export function buildDescriptionExcerpt(
  plain: string,
  max = COIN_DESCRIPTION_EXCERPT_MAX,
): CoinDescriptionExcerpt {
  const full = plain.trim()
  if (full.length <= max) {
    return { excerpt: full, full, isExpandable: false }
  }
  let cut = full.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  if (lastSpace > max * 0.55) {
    cut = cut.slice(0, lastSpace)
  }
  const excerpt = cut.trimEnd()
  return { excerpt, full, isExpandable: true }
}

/** `description.en` as plain text: `undefined` → `''`, else `trim()`. */
export function normalizeDescriptionEn(raw: string | undefined): string {
  if (raw == null) {
    return ''
  }
  return raw.trim()
}
