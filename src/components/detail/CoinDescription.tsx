import { useEffect, useMemo, useState } from 'react'
import {
  buildDescriptionExcerpt,
  normalizeDescriptionEn,
} from '../../utils/coinDescription'

export type CoinDescriptionProps = {
  /** `description.en` from CoinGecko (plain text). */
  descriptionEn: string | undefined
  /** Reset expanded state when the asset changes. */
  coinId: string
}

export function CoinDescription({
  descriptionEn,
  coinId,
}: CoinDescriptionProps) {
  const plain = useMemo(
    () => normalizeDescriptionEn(descriptionEn),
    [descriptionEn],
  )
  const { excerpt, full, isExpandable } = useMemo(
    () => buildDescriptionExcerpt(plain),
    [plain],
  )
  const hasDescription = plain.trim().length > 0
  const [expanded, setExpanded] = useState(false)

  useEffect(
    function resetExpandedOnCoinChange() {
      setExpanded(false)
    },
    [coinId],
  )

  const displayText = expanded || !isExpandable ? full : excerpt

  return (
    <section
      className="mt-10 border-t border-slate-100 pt-8"
      aria-labelledby="coin-description-heading"
    >
      <h3
        id="coin-description-heading"
        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
      >
        About
      </h3>
      {hasDescription ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {displayText}
          </p>
          {isExpandable ? (
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-blue-600 underline decoration-blue-600/40 underline-offset-[3px] hover:text-blue-700 hover:decoration-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          ) : null}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No description available for this asset.
        </p>
      )}
    </section>
  )
}
