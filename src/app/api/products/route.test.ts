import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuth, requireAdmin, prismaMock } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  requireAdmin: vi.fn(),
  prismaMock: {
    $transaction: vi.fn(),
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAuth,
  requireAdmin,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { GET, POST } from './route'

const makeProduct = () => ({
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Keyboard',
  category: 'Peripherals',
  quantity: 10,
  createdAt: new Date('2026-03-01T10:00:00.000Z'),
  updatedAt: new Date('2026-03-01T10:00:00.000Z'),
})

describe('api/products route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(
      async (operations: Promise<unknown>[]) => Promise.all(operations),
    )
  })

  it('GET returns paginated products for authenticated users', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })
    const product = makeProduct()
    prismaMock.product.findMany.mockResolvedValue([product])
    prismaMock.product.count.mockResolvedValue(1)

    const response = await GET(
      new Request('http://localhost:3000/api/products?page=1&limit=20'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.items).toHaveLength(1)
    expect(body.data.pageInfo.totalItems).toBe(1)
  })

  it('GET returns 401 AUTH_UNAUTHENTICATED when user is unauthenticated', async () => {
    requireAuth.mockRejectedValue(
      new Error('Unauthorized: Authentication required'),
    )

    const response = await GET(
      new Request('http://localhost:3000/api/products'),
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })

  it('GET returns 422 INVALID_REQUEST_BODY for invalid query params', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    const response = await GET(
      new Request('http://localhost:3000/api/products?limit=abc'),
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })

  it('POST returns 201 and product for admin users', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    const product = makeProduct()
    prismaMock.product.create.mockResolvedValue(product)

    const response = await POST(
      new Request('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sku: 'SKU-001',
          name: 'Keyboard',
          category: 'Peripherals',
          quantity: 10,
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.ok).toBe(true)
    expect(body.data.product.id).toBe('prod-1')
  })

  it('POST returns 403 AUTH_FORBIDDEN for non-admin users', async () => {
    requireAdmin.mockRejectedValue(
      new Error('Forbidden: Admin access required'),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sku: 'SKU-001',
          name: 'Keyboard',
          category: 'Peripherals',
          quantity: 10,
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_FORBIDDEN')
  })

  it('POST returns 422 INVALID_REQUEST_BODY for invalid payload', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    const response = await POST(
      new Request('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          sku: '',
          name: 'Keyboard',
          category: 'Peripherals',
          quantity: 10,
        }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })
})
