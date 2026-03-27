import { useEffect, type RefObject } from 'react'

const TABBABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function tabbableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].filter(
    (el) => {
      if (el.tabIndex < 0) return false
      if (el.closest('[aria-hidden="true"]')) return false
      return true
    },
  )
}

/**
 * While the drawer is mounted: Tab / Shift+Tab cycle within `panelRef` only.
 * Uses capture so we run before the browser moves focus outside the panel.
 */
export function useDrawerFocusTrap(
  panelRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel?.isConnected) return

      const items = tabbableElements(panel)
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (active == null || !panel.contains(active)) {
        event.preventDefault()
        first.focus()
        return
      }

      if (event.shiftKey) {
        if (active === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [panelRef])
}
