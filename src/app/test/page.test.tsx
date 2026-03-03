import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Page from './page'

test('renders test page', () => {
  render(<Page />)
  const heading = screen.getByRole('heading', { name: /test page/i })
  expect(heading).toBeDefined()
})
