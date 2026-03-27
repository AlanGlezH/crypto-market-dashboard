import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { createQueryClient } from './queryClient'

function renderApp() {
  const client = createQueryClient()
  return render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

describe('App', () => {
  it('renders header and main shell', () => {
    renderApp()
    expect(
      screen.getByRole('heading', { level: 1, name: /clara market dashboard/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText(/top 20 by market cap/i)).toBeInTheDocument()
  })
})
