import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, prismaMock } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  prismaMock: {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAdmin,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { DELETE, PATCH } from './route'

const makeProduct = () => ({
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Keyboard',
  category: 'Peripherals',
  quantity: 10,
  createdAt: new Date('2026-03-01T10:00:00.000Z'),
  updatedAt: new Date('2026-03-01T10:00:00.000Z'),
})

describe('api/products/[id] route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH returns 200 for admin update success', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.product.findUnique.mockResolvedValue({ id: 'prod-1' })
    prismaMock.product.update.mockResolvedValue(makeProduct())

    const response = await PATCH(
      new Request('http://localhost:3000/api/products/prod-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      }),
      { params: Promise.resolve({ id: 'prod-1' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('PATCH returns 404 PRODUCT_NOT_FOUND when product does not exist', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost:3000/api/products/prod-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' }),
      }),
      { params: Promise.resolve({ id: 'prod-1' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND')
  })

  it('PATCH returns 422 INVALID_REQUEST_BODY for invalid payload', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    const response = await PATCH(
      new Request('http://localhost:3000/api/products/prod-1', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: 'prod-1' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })

  it('DELETE returns 200 with deleted payload on success', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.product.findUnique.mockResolvedValue({ id: 'prod-1' })
    prismaMock.product.delete.mockResolvedValue({ id: 'prod-1' })

    const response = await DELETE(
      new Request('http://localhost:3000/api/products/prod-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'prod-1' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data).toEqual({ deleted: true, id: 'prod-1' })
  })

  it('DELETE returns 404 PRODUCT_NOT_FOUND when product does not exist', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.product.findUnique.mockResolvedValue(null)

    const response = await DELETE(
      new Request('http://localhost:3000/api/products/prod-1', {
        method: 'DELETE',
      }),
      { params: Promise.resolve({ id: 'prod-1' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND')
  })
})
