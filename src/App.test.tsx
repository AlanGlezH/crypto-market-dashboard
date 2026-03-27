import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useMarkets } from './hooks/useMarkets'
import { createQueryClient } from './queryClient'
import { RateLimitError } from './utils/error/errors'

vi.mock('./hooks/useMarkets', () => ({
  useMarkets: vi.fn(),
}))

function renderApp() {
  const client = createQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)
  })

  it('renders header and main shell', () => {
    renderApp()
    expect(
      screen.getByRole('heading', { level: 1, name: /clara market dashboard/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText(/top 20 by market cap/i)).toBeInTheDocument()
  })

  it('shows rate-limit copy and Retry when markets query hits RateLimitError', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useMarkets).mockReturnValue({
      isError: true,
      error: new RateLimitError(),
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByText(/temporarily limiting requests/i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^retry$/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows generic error message and Retry for non-429 errors', async () => {
    const user = userEvent.setup()
    const refetch = vi.fn()
    vi.mocked(useMarkets).mockReturnValue({
      isError: true,
      error: new Error('Server exploded'),
      isPending: false,
      refetch,
    } as unknown as ReturnType<typeof useMarkets>)

    renderApp()

    expect(screen.getByText('Server exploded')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^retry$/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })

  it('shows skeleton table while markets query is pending', () => {
    vi.mocked(useMarkets).mockReturnValue({
      isError: false,
      error: null,
      isPending: true,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useMarkets>)

    const { container } = renderApp()

    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(
      screen.queryByText(/markets table will load here/i),
    ).not.toBeInTheDocument()
  })
})
