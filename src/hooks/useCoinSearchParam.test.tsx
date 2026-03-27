import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCoinSearchParam } from './useCoinSearchParam'

describe('useCoinSearchParam', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.history.pushState(null, '', '/')
  })

  it('reads initial coin from location.search', () => {
    window.history.pushState(null, '', '/?coin=bitcoin')
    const { result } = renderHook(() => useCoinSearchParam())
    expect(result.current.coinId).toBe('bitcoin')
  })

  it('setCoinId updates URL via pushState and state', () => {
    const pushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
    const { result } = renderHook(() => useCoinSearchParam())
    act(() => {
      result.current.setCoinId('ethereum')
    })
    expect(pushSpy).toHaveBeenCalledWith(
      null,
      '',
      expect.stringContaining('coin=ethereum'),
    )
    expect(result.current.coinId).toBe('ethereum')
  })

  it('setCoinId(null) clears coin param', () => {
    window.history.pushState(null, '', '/?coin=bitcoin')
    const pushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
    const { result } = renderHook(() => useCoinSearchParam())
    act(() => {
      result.current.setCoinId(null)
    })
    expect(pushSpy).toHaveBeenCalled()
    expect(result.current.coinId).toBeNull()
  })

  it('setCoinId can use replaceState', () => {
    const pushSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {})
    const replaceSpy = vi
      .spyOn(window.history, 'replaceState')
      .mockImplementation(() => {})
    const { result } = renderHook(() => useCoinSearchParam())
    act(() => {
      result.current.setCoinId('solana', 'replace')
    })
    expect(replaceSpy).toHaveBeenCalledWith(
      null,
      '',
      expect.stringContaining('coin=solana'),
    )
    expect(pushSpy).not.toHaveBeenCalled()
  })
})
