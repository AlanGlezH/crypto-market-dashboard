import { useId } from 'react'

export type EmptyStateProps = {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const titleId = useId()

  return (
    <div
      role="status"
      className="px-6 py-12 text-center"
      aria-live="polite"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="text-sm font-medium text-slate-800">
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
  )
}
