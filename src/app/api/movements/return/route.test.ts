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

describe('api/movements/return route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST returns 200 on successful return', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            findUnique: vi
              .fn()
              .mockResolvedValue({ id: 'prod-1', quantity: 8 }),
            update: vi.fn().mockResolvedValue({
              id: 'prod-1',
              sku: 'SKU-001',
              name: 'Keyboard',
              category: 'Peripherals',
              quantity: 10,
              createdAt: new Date('2026-03-01T10:00:00.000Z'),
              updatedAt: new Date('2026-03-01T10:00:00.000Z'),
            }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({
              id: 'move-2',
              type: 'IN',
              quantity: 2,
              userId: 'user-1',
              productId: 'prod-1',
              createdAt: new Date('2026-03-01T10:00:00.000Z'),
            }),
          },
        }),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/return', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'prod-1', quantity: 2 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.movement.type).toBe('IN')
    expect(body.data.product.quantity).toBe(10)
  })

  it('POST returns 404 PRODUCT_NOT_FOUND when product does not exist', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: unknown) => Promise<unknown>) =>
        callback({
          product: {
            findUnique: vi.fn().mockResolvedValue(null),
            update: vi.fn(),
          },
          inventoryMovement: {
            create: vi.fn(),
          },
        }),
    )

    const response = await POST(
      new Request('http://localhost:3000/api/movements/return', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: 'missing', quantity: 1 }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('PRODUCT_NOT_FOUND')
  })

  it('POST returns 422 INVALID_MOVEMENT_QUANTITY for invalid payload', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })

    const response = await POST(
      new Request('http://localhost:3000/api/movements/return', {
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
      new Request('http://localhost:3000/api/movements/return', {
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
      new Request('http://localhost:3000/api/movements/return', {
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
