import { isValidElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

const listProductsMock = vi.fn()

vi.mock('@/lib/products/queries', () => ({
  listProducts: (input: unknown) => listProductsMock(input),
}))

vi.mock('./products-admin-client', () => ({
  ProductsAdminClient: () => <div data-testid='products-admin-client' />,
}))

import { ProductsAdminContent } from './products-admin-content'

describe('ProductsAdminContent', () => {
  it('sanitizes invalid query params without throwing', async () => {
    listProductsMock.mockResolvedValue({
      items: [],
      pageInfo: {
        page: 1,
        limit: 20,
        totalItems: 0,
        totalPages: 1,
      },
    })

    const result = await ProductsAdminContent({
      query: {
        search: '  keyboard  ',
        sortBy: 'invalid',
        sortOrder: 'down',
        page: 'abc',
        limit: '20',
      },
    })

    expect(listProductsMock).toHaveBeenCalledWith({
      search: 'keyboard',
      category: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: 1,
      limit: 20,
    })

    expect(isValidElement(result)).toBe(true)
    expect(result.props).toEqual(
      expect.objectContaining({
        initialQuery: {
          search: 'keyboard',
          limit: 20,
          page: 1,
          sortBy: undefined,
          sortOrder: undefined,
        },
      }),
    )
  })
})
