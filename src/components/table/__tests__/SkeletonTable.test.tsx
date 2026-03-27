import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkeletonTable } from '../SkeletonTable'

describe('SkeletonTable', () => {
  it('renders a busy table shell with header labels and 20 body rows', () => {
    const { container } = render(<SkeletonTable />)

    const busy = container.querySelector('[aria-busy="true"]')
    expect(busy).toBeTruthy()

    const table = screen.getByRole('table')
    expect(
      within(table).getByRole('columnheader', { name: /^rank$/i }),
    ).toBeInTheDocument()
    expect(
      within(table).getByRole('columnheader', { name: /price \(usd\)/i }),
    ).toBeInTheDocument()

    const bodyRows = within(
      table.querySelector('tbody') as HTMLElement,
    ).getAllByRole('row')
    expect(bodyRows).toHaveLength(20)
  })
})
