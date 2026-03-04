import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, prismaMock } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  prismaMock: {
    $transaction: vi.fn(),
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAdmin,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { GET } from './route'

describe('api/users route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(
      async (operations: Promise<unknown>[]) => Promise.all(operations),
    )
  })

  it('GET returns paginated users for admin', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        email: 'user@example.com',
        name: 'User One',
        role: 'USER',
      },
    ])
    prismaMock.user.count.mockResolvedValue(1)

    const response = await GET(
      new Request('http://localhost:3000/api/users?page=1&limit=20'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.items).toHaveLength(1)
    expect(body.data.items[0]).not.toHaveProperty('clerkId')
    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      where: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    })
  })

  it('GET returns 401 AUTH_UNAUTHENTICATED for unauthenticated users', async () => {
    requireAdmin.mockRejectedValue(
      new Error('Unauthorized: Authentication required'),
    )

    const response = await GET(new Request('http://localhost:3000/api/users'))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })

  it('GET returns 403 AUTH_FORBIDDEN for non-admin users', async () => {
    requireAdmin.mockRejectedValue(
      new Error('Forbidden: Admin access required'),
    )

    const response = await GET(new Request('http://localhost:3000/api/users'))
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_FORBIDDEN')
  })
})
