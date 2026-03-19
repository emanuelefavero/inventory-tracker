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

vi.mock('../_store/use-products-admin-ui-store', () => ({
  useProductsAdminUIStore: (
    selector: (s: Record<string, unknown>) => unknown,
  ) => selector({ openCreate: () => {} }),
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

  it('clears search when the clear button is clicked', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery()}
        items={[makeProduct()]}
        pageInfo={{ page: 1, limit: 20, totalItems: 1, totalPages: 1 }}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }))

    vi.advanceTimersByTime(300)
    expect(replaceMock).toHaveBeenCalledWith(
      '/admin/products?sortBy=name&sortOrder=asc',
      { scroll: false },
    )
  })

  it('search input remains interactive during transitions', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery()}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 30, totalPages: 2 }}
      />,
    )

    const searchInput = screen.getByRole('textbox', {
      name: /search products/i,
    })
    expect(searchInput).not.toHaveProperty('disabled', true)
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

  it('includes default sortBy when toggling sort order from default url state', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ sortBy: undefined, sortOrder: undefined })}
        items={[makeProduct()]}
        pageInfo={{ page: 2, limit: 20, totalItems: 30, totalPages: 2 }}
      />,
    )

    fireEvent.click(
      screen.getByRole('button', { name: /sort order descending/i }),
    )

    expect(replaceMock).toHaveBeenCalledWith(
      '/admin/products?search=keyboard&sortBy=updatedAt&sortOrder=asc',
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

  it('renders the catalog empty state when there are no items and no search', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 1, search: undefined })}
        items={[]}
        pageInfo={{ page: 1, limit: 20, totalItems: 0, totalPages: 1 }}
      />,
    )

    expect(screen.getByText('No products yet')).toBeDefined()
    expect(
      screen.getByRole('button', { name: /create your first product/i }),
    ).toBeDefined()
  })

  it('renders the search empty state when search returns no results', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 1, search: 'nonexistent' })}
        items={[]}
        pageInfo={{ page: 1, limit: 20, totalItems: 0, totalPages: 1 }}
      />,
    )

    expect(screen.getByText('No matching products')).toBeDefined()
    expect(
      screen.queryByRole('button', { name: /create your first product/i }),
    ).toBeNull()
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

  it('renders category as a badge', () => {
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 1 })}
        items={[makeProduct()]}
        pageInfo={{ page: 1, limit: 20, totalItems: 1, totalPages: 1 }}
      />,
    )

    const badge = screen.getByText('Peripherals')
    expect(badge.dataset.slot).toBe('badge')
  })

  it('applies destructive style to low-stock quantities', () => {
    const lowStockProduct = { ...makeProduct(), quantity: 3 }
    render(
      <ProductsAdminClient
        initialQuery={makeQuery({ page: 1 })}
        items={[lowStockProduct]}
        pageInfo={{ page: 1, limit: 20, totalItems: 1, totalPages: 1 }}
      />,
    )

    const cell = screen.getByText('3')
    expect(cell.className).toContain('text-destructive')
  })
})
