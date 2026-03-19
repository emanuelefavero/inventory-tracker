import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getCurrentUserMock = vi.fn()
const redirectMock = vi.fn()
const productsAdminContentMock = vi.fn()

vi.mock('@/lib/auth-helpers', () => ({
  getCurrentUser: () => getCurrentUserMock(),
}))

vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}))

vi.mock('./_components/products-admin-content', () => ({
  ProductsAdminContent: (props: {
    query: Record<string, string | undefined>
  }) => productsAdminContentMock(props),
}))

import ProductsAdminPage from './page'

describe('admin products page', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    redirectMock.mockReset()
    productsAdminContentMock.mockReset()
    productsAdminContentMock.mockReturnValue(
      <div data-testid='products-admin-content'>Products content</div>,
    )
  })

  it('renders the admin page for admins and normalizes query params', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    render(
      await ProductsAdminPage({
        searchParams: Promise.resolve({
          search: ['keyboard', 'ignored'],
          page: '2',
          sortBy: 'name',
        }),
      }),
    )

    expect(
      screen.getByRole('heading', { name: /product catalog/i }),
    ).toBeDefined()
    expect(productsAdminContentMock).toHaveBeenCalledWith({
      query: {
        search: 'keyboard',
        page: '2',
        sortBy: 'name',
      },
    })
  })

  it('redirects unauthenticated users to home', async () => {
    getCurrentUserMock.mockResolvedValue(null)
    redirectMock.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT')
    })

    await expect(
      ProductsAdminPage({
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirectMock).toHaveBeenCalledWith('/')
  })

  it('renders a blocked state for authenticated non-admin users', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-1', role: 'USER' })

    render(
      await ProductsAdminPage({
        searchParams: Promise.resolve({}),
      }),
    )

    expect(screen.getByText('Admin access required')).toBeDefined()
  })
})
