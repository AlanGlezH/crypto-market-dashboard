import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import * as jestAxeMatchers from 'jest-axe'
import { afterEach, expect } from 'vitest'

expect.extend(jestAxeMatchers.toHaveNoViolations)

afterEach(() => {
  cleanup()
})
