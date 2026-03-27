/** Capture the focused row before clearing `?coin=` so focus can restore after drawer close (FR-4.6). */
export function captureSelectedMarketRow(): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    'tr[aria-current="true"][tabindex="0"]',
  )
}

export function restoreMarketRowFocus(row: HTMLElement | null): void {
  if (row == null || !row.isConnected) {
    return
  }
  // After close, `main` is no longer `inert` only once React has committed; the next frame is enough.
  requestAnimationFrame(() => {
    if (row.isConnected) row.focus()
  })
}
