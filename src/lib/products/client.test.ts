import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createProduct, deleteProduct, updateProduct } from './client'

const fetchMock = vi.fn()

vi.stubGlobal('fetch', fetchMock)

const makeProduct = () => ({
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Keyboard',
  category: 'Peripherals',
  quantity: 10,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
})

describe('products client', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  it('createProduct posts JSON and returns success results', async () => {
    const result = {
      ok: true as const,
      data: {
        product: makeProduct(),
      },
    }

    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue(result),
    })

    await expect(
      createProduct({
        sku: 'SKU-001',
        name: 'Keyboard',
        category: 'Peripherals',
        quantity: 10,
      }),
    ).resolves.toEqual(result)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sku: 'SKU-001',
          name: 'Keyboard',
          category: 'Peripherals',
          quantity: 10,
        }),
      }),
    )
  })

  it('updateProduct preserves API error results', async () => {
    const result = {
      ok: false as const,
      error: {
        code: 'PRODUCT_NOT_FOUND' as const,
        message: 'Product not found',
      },
    }

    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue(result),
    })

    await expect(
      updateProduct('prod-1', { name: 'Updated name' }),
    ).resolves.toEqual(result)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.objectContaining({
        method: 'PATCH',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Updated name' }),
      }),
    )
  })

  it('deleteProduct returns success results for delete operations', async () => {
    const result = {
      ok: true as const,
      data: {
        deleted: true as const,
        id: 'prod-1',
      },
    }

    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue(result),
    })

    await expect(deleteProduct('prod-1')).resolves.toEqual(result)

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/products/prod-1',
      expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }),
    )
  })

  it('returns INTERNAL_ERROR when fetch rejects or the payload is invalid', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'))

    await expect(deleteProduct('prod-1')).resolves.toEqual({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unexpected server error',
      },
    })

    fetchMock.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ nope: true }),
    })

    await expect(
      createProduct({
        sku: 'SKU-002',
        name: 'Mouse',
        category: 'Peripherals',
        quantity: 4,
      }),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unexpected server error',
      },
    })
  })
})
