import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CoinDescription } from '../CoinDescription'

const LONG_PLAIN = `${'Lorem ipsum dolor sit amet. '.repeat(14)}Tail end marker.`

describe('CoinDescription', () => {
  it('shows fallback when description is missing', () => {
    render(
      <CoinDescription coinId="btc" descriptionEn={undefined} />,
    )
    expect(
      screen.getByText(/no description available/i),
    ).toBeInTheDocument()
  })

  it('shows fallback for empty or whitespace-only', () => {
    const onlyWhitespace = `  ${'\n'}\t  `
    render(<CoinDescription coinId="x" descriptionEn={onlyWhitespace} />)
    expect(
      screen.getByText(/no description available/i),
    ).toBeInTheDocument()
  })

  it('shows full short text without toggle', () => {
    render(
      <CoinDescription coinId="eth" descriptionEn="Short bio here." />,
    )
    expect(screen.getByText('Short bio here.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /read more/i })).toBeNull()
  })

  it('truncates long text and toggles read more / read less', async () => {
    const user = userEvent.setup()
    render(<CoinDescription coinId="ada" descriptionEn={LONG_PLAIN} />)

    expect(screen.queryByText(/tail end marker/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^read more$/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await user.click(screen.getByRole('button', { name: /^read more$/i }))
    expect(screen.getByText(LONG_PLAIN)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^read less$/i }),
    ).toHaveAttribute('aria-expanded', 'true')

    await user.click(screen.getByRole('button', { name: /^read less$/i }))
    expect(screen.queryByText(/tail end marker/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^read more$/i }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders plain excerpt without toggle when under limit', () => {
    render(
      <CoinDescription coinId="dot" descriptionEn="Bold intro only" />,
    )
    expect(screen.getByText('Bold intro only')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /read more/i })).toBeNull()
  })
})
