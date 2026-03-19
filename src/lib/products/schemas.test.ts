import { describe, expect, it } from 'vitest'

import { sanitizeListProductsQuery } from './schemas'

describe('sanitizeListProductsQuery', () => {
  it('preserves valid query params', () => {
    expect(
      sanitizeListProductsQuery({
        search: 'keyboard',
        category: 'Peripherals',
        sortBy: 'name',
        sortOrder: 'asc',
        page: '2',
        limit: '50',
      }),
    ).toEqual({
      search: 'keyboard',
      category: 'Peripherals',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 2,
      limit: 50,
    })
  })

  it('falls back only invalid fields while preserving valid ones', () => {
    expect(
      sanitizeListProductsQuery({
        search: '  keyboard  ',
        category: '  Peripherals  ',
        sortBy: 'nope',
        sortOrder: 'sideways',
        page: 'abc',
        limit: '20',
      }),
    ).toEqual({
      search: 'keyboard',
      category: 'Peripherals',
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: 20,
    })
  })

  it('defaults missing values and clears empty strings', () => {
    expect(
      sanitizeListProductsQuery({
        search: '   ',
        category: '',
      }),
    ).toEqual({
      search: undefined,
      category: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: 20,
    })
  })

  it('falls back to default limit when limit exceeds max', () => {
    expect(
      sanitizeListProductsQuery({
        limit: '101',
      }),
    ).toEqual({
      search: undefined,
      category: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: 20,
    })
  })
})
