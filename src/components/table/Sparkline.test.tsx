import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { normalizeSparklinePrices, Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('does not throw when prices are missing or empty', () => {
    expect(() =>
      render(
        <Sparkline prices={undefined} change24hPercent={null} />,
      ),
    ).not.toThrow()
    expect(() =>
      render(<Sparkline prices={[]} change24hPercent={1} />),
    ).not.toThrow()
  })

  it('shows placeholder when fewer than two finite prices', () => {
    const { container, rerender } = render(
      <Sparkline prices={[1]} change24hPercent={null} />,
    )
    expect(container.querySelector('svg')).toBeNull()
    expect(container).toHaveTextContent('—')

    rerender(<Sparkline prices={[NaN, Infinity]} change24hPercent={null} />)
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders chart svg when there is a usable series', () => {
    const { container } = render(
      <Sparkline prices={[10, 12, 11, 13]} change24hPercent={1.5} />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('normalizeSparklinePrices drops non-finite values', () => {
    expect(normalizeSparklinePrices([1, NaN, 3])).toEqual([1, 3])
    expect(normalizeSparklinePrices(undefined)).toEqual([])
  })
})
