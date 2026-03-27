import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DetailDrawer } from './DetailDrawer'

describe('DetailDrawer', () => {
  it('renders dialog with close control when mounted', () => {
    render(<DetailDrawer coinId="bitcoin" onClose={vi.fn()} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /asset details/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^close$/i }),
    ).toBeInTheDocument()
  })

  it('calls onClose when Close is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DetailDrawer coinId="ethereum" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /^close$/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DetailDrawer coinId="btc" onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /close drawer/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<DetailDrawer coinId="btc" onClose={onClose} />)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
