import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBanner } from '../ErrorBanner'

describe('ErrorBanner', () => {
  it('renders title, message and Retry', () => {
    render(
      <ErrorBanner message="Something failed" onRetry={vi.fn()} />,
    )
    expect(
      screen.getByRole('heading', {
        name: /connection interrupted/i,
      }),
    ).toBeInTheDocument()
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

  it('has no axe-detectable a11y violations', async () => {
    const { container } = render(
      <ErrorBanner message="Something went wrong" onRetry={vi.fn()} />,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
