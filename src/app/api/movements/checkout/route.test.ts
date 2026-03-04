import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuth, prismaMock } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  prismaMock: {
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAuth,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { POST } from './route'

describe('api/movements/checkout route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST returns 200 on successful checkout', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })
    const findUnique = vi.fn().mockResolvedValue({
      id: 'prod-1',
      sku: 'SKU-001',
      name: 'Keyboard',
      category: 'Peripherals',
      quantity: 8,
      createdAt: new Date('2026-03-01T10:00:00.000Z'),
      updatedAt: new Date('2026-03-01T10:00:00.000Z'),
    })
    const updateMany = vi.fn().mockResolvedValue({ count: 1 })

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            updateMany,
            findUnique,
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({
              id: 'move-1',
              type: 'OUT',
              quantity: 2,
              userId: 'user-1',
              productId: 'prod-1',
              createdAt: new Date('2026-03-01T10:00:00.000Z'),
            }),
          },
        }),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', quantity: 2 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.movement.type).toBe('OUT')
    expect(body.data.product.quantity).toBe(8)
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: 'prod-1',
        quantity: { gte: 2 },
      },
      data: {
        quantity: { decrement: 2 },
      },
    })
  })

  it('POST returns 404 PRODUCT_NOT_FOUND when product does not exist', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })
    const findUnique = vi.fn().mockResolvedValue(null)

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            findUnique,
          },
          inventoryMovement: {
            create: vi.fn(),
          },
        }),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'missing', quantity: 1 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND')
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'missing' },
      select: { id: true },
    })
  })

  it('POST returns 409 INSUFFICIENT_STOCK when quantity exceeds stock', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            findUnique: vi.fn().mockResolvedValue({ id: 'prod-1' }),
          },
          inventoryMovement: {
            create: vi.fn(),
          },
        }),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', quantity: 5 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INSUFFICIENT_STOCK')
  })

  it('POST returns 422 INVALID_MOVEMENT_QUANTITY for invalid payload', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', quantity: 0 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_MOVEMENT_QUANTITY')
  })

  it('POST returns 422 INVALID_REQUEST_BODY for non-quantity schema errors', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ quantity: 2 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })

  it('POST returns 401 AUTH_UNAUTHENTICATED when user is unauthenticated', async () => {
    requireAuth.mockRejectedValue(
      new Error('Unauthorized: Authentication required'),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', quantity: 2 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })
})
