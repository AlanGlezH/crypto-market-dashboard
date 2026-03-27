import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders header and main shell', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: /clara market dashboard/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText(/top 20 by market cap/i)).toBeInTheDocument()
  })
})
