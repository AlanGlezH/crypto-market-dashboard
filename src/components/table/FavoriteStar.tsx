import type { KeyboardEvent, MouseEvent } from 'react'

type FavoriteStarProps = {
  coinName: string
  active: boolean
  onToggle: () => void
}

function StarOutline() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4 shrink-0"
      aria-hidden={true}
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  )
}

function StarFilled() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="size-4 shrink-0"
      aria-hidden={true}
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export function FavoriteStar({ coinName, active, onToggle }: FavoriteStarProps) {
  const ariaLabel = active
    ? `Remove ${coinName} from favorites`
    : `Add ${coinName} to favorites`

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation()
    onToggle()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation()
    }
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      className={
        active
          ? 'inline-flex shrink-0 rounded p-0.5 text-amber-400 transition-colors hover:text-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400'
          : 'inline-flex shrink-0 rounded p-0.5 text-slate-300 transition-colors hover:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400'
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {active ? <StarFilled /> : <StarOutline />}
    </button>
  )
}
