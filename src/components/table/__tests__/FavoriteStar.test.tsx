import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FavoriteStar } from '../FavoriteStar'

describe('FavoriteStar', () => {
  it('calls onToggle on click', () => {
    const toggle = vi.fn()
    render(<FavoriteStar coinName="Bitcoin" active={false} onToggle={toggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(toggle).toHaveBeenCalledOnce()
  })

  it('does not propagate click to parent', () => {
    const parent = vi.fn()
    render(
      <div onClick={parent}>
        <FavoriteStar coinName="Bitcoin" active={false} onToggle={vi.fn()} />
      </div>,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(parent).not.toHaveBeenCalled()
  })

  it('sets aria-pressed matching active prop', () => {
    const { rerender } = render(
      <FavoriteStar coinName="Bitcoin" active={false} onToggle={vi.fn()} />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

    rerender(<FavoriteStar coinName="Bitcoin" active onToggle={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })
})
