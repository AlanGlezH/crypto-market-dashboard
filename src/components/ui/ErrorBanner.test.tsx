import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBanner } from './ErrorBanner'

describe('ErrorBanner', () => {
  it('renders message and Retry', () => {
    render(
      <ErrorBanner message="Something failed" onRetry={vi.fn()} />,
    )
    expect(screen.getByText('Something failed')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^retry$/i }),
    ).toBeInTheDocument()
  })

  it('calls onRetry once when Retry is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    render(<ErrorBanner message="Try again" onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: /^retry$/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
