import { beforeEach, describe, expect, it } from 'vitest'
import {
  captureSelectedMarketRow,
  restoreMarketRowFocus,
} from '../restoreMarketRowFocus'

describe('restoreMarketRowFocus', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns null when no selected row exists', () => {
    document.body.innerHTML = '<table><tbody><tr><td>x</td></tr></tbody></table>'
    expect(captureSelectedMarketRow()).toBeNull()
  })

  it('captures tr with aria-current and tabindex 0', () => {
    document.body.innerHTML =
      '<table><tbody><tr aria-current="true" tabindex="0"><td>coin</td></tr></tbody></table>'
    const row = captureSelectedMarketRow()
    expect(row).not.toBeNull()
    expect(row?.tagName).toBe('TR')
  })

  it('focuses a connected row after the next animation frame', async () => {
    const tr = document.createElement('tr')
    tr.tabIndex = 0
    document.body.appendChild(tr)
    restoreMarketRowFocus(tr)
    await new Promise<void>((r) => requestAnimationFrame(() => r()))
    expect(document.activeElement).toBe(tr)
  })
})
