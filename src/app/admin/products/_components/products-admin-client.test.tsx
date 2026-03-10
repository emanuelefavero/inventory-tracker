import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ProductsAdminClient,
  ProductsAdminQueryState,
} from './products-admin-client'

const replaceMock = vi.fn()
const useRouterMock = vi.fn()
const usePathnameMock = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
  useRouter: () => useRouterMock(),
}))

const makeQuery = (
  overrides: Partial<ProductsAdminQueryState> = {},
): ProductsAdminQueryState => ({
  limit: 20,
  page: 2,
  search: 'keyboard',
  sortBy: 'name',
  sortOrder: 'asc',
  ...overrides,
})

const makeProduct = () => ({
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Keyboard',
  category: 'Peripherals',
  quantity: 10,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
})

describe('ProductsAdminClient', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  beforeEach(() => {
    HTMLElement.prototype.hasPointerCapture ??= () => false
    HTMLElement.prototype.releasePointerCapture ??= () => undefined
    HTMLElement.prototype.setPointerCapture ??= () => undefined
    vi.useFakeTimers()
    replaceMock.mockReset()
    useRouterMock.mockReturnValue({ replace: replaceMock })
    usePathnameMock.mockReturnValue('/admin/products')
  })

  it('debounces search updates and resets page to 1', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery()}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 30, totalPages: 2 }}
      />,
    )

    fireEvent.change(
      screen.getByRole('textbox', { name: /search products/i }),
      {
        target: { value: 'mouse' },
      },
    )

    vi.advanceTimersByTime(299)
    expect(replaceMock).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(replaceMock).toHaveBeenCalledWith(
      '/admin/products?search=mouse&sortBy=name&sortOrder=asc',
      { scroll: false },
    )
  })

  it('updates sort state immediately and resets page to 1', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery()}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 30, totalPages: 2 }}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /sort order ascending/i }),
    )

    expect(replaceMock).toHaveBeenCalledWith(
      '/admin/products?search=keyboard&sortBy=name&sortOrder=desc',
      { scroll: false },
    )
  })

  it('navigates to previous and next pages while preserving filters', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery()}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 45, totalPages: 3 }}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /go to previous products page/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /go to next products page/i }),
    )

    expect(replaceMock).toHaveBeenNthCalledWith(
      1,
      '/admin/products?search=keyboard&sortBy=name&sortOrder=asc',
      { scroll: false },
    )
    expect(replaceMock).toHaveBeenNthCalledWith(
      2,
      '/admin/products?search=keyboard&sortBy=name&sortOrder=asc&page=3',
      { scroll: false },
    )
  })

  it('renders the empty state when there are no items', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 1, search: undefined })}
        items={[]}
        pageInfo={{ page: 1, limit: 20, totalItems: 0, totalPages: 1 }}
      />,
    )

    expect(screen.getByText('No products yet')).toBeDefined()
  })

  it('renders the table summary using totalItems', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 2 })}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 21, totalPages: 2 }}
      />,
    )

    expect(screen.getByText('Showing 21-21 of 21 products')).toBeDefined()
  })
})
