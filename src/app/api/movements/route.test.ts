import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuth, prismaMock } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  prismaMock: {
    $transaction: vi.fn(),
    inventoryMovement: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAuth,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { GET } from './route'

describe('api/movements route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(
      async (operations: Promise<unknown>[]) => Promise.all(operations),
    )
  })

  it('GET returns paginated movements for authenticated users', async () => {
    requireAuth.mockResolvedValue({ id: 'user-1', role: 'USER' })
    prismaMock.inventoryMovement.findMany.mockResolvedValue([
      {
        id: 'move-1',
        type: 'OUT',
        quantity: 2,
        userId: 'user-1',
        productId: 'prod-1',
        createdAt: new Date('2026-03-01T10:00:00.000Z'),
      },
    ])
    prismaMock.inventoryMovement.count.mockResolvedValue(1)

    const response = await GET(
      new Request('http://localhost:3000/api/movements?page=1&limit=20'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.items).toHaveLength(1)
  })

  it('GET returns 401 AUTH_UNAUTHENTICATED when user is unauthenticated', async () => {
    requireAuth.mockRejectedValue(
      new Error('Unauthorized: Authentication required'),
    )

    const response = await GET(
      new Request('http://localhost:3000/api/movements'),
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })
})
