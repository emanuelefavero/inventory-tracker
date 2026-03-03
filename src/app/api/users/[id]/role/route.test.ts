import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdmin, updateUserRole, prismaMock } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  updateUserRole: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth-helpers', () => ({
  requireAdmin,
  updateUserRole,
}))

vi.mock('@/lib/prisma', () => ({
  default: prismaMock,
}))

import { PATCH } from './route'

describe('api/users/[id]/role route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH returns 200 and updated user on success', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.user.findUnique
      .mockResolvedValueOnce({ id: 'user-2' })
      .mockResolvedValueOnce({
        id: 'user-2',
        email: 'user2@example.com',
        name: 'User Two',
        role: 'ADMIN',
      })
    updateUserRole.mockResolvedValue(undefined)

    const response = await PATCH(
      new Request('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.data.user.id).toBe('user-2')
  })

  it('PATCH returns 404 USER_NOT_FOUND when target user does not exist', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })
    prismaMock.user.findUnique.mockResolvedValue(null)

    const response = await PATCH(
      new Request('http://localhost:3000/api/users/missing/role', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      }),
      { params: Promise.resolve({ id: 'missing' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('USER_NOT_FOUND')
  })

  it('PATCH returns 422 INVALID_REQUEST_BODY for invalid payload', async () => {
    requireAdmin.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' })

    const response = await PATCH(
      new Request('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'MANAGER' }),
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('INVALID_REQUEST_BODY')
  })

  it('PATCH returns 403 AUTH_FORBIDDEN for non-admin users', async () => {
    requireAdmin.mockRejectedValue(
      new Error('Forbidden: Admin access required'),
    )

    const response = await PATCH(
      new Request('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_FORBIDDEN')
  })

  it('PATCH returns 401 AUTH_UNAUTHENTICATED for unauthenticated users', async () => {
    requireAdmin.mockRejectedValue(
      new Error('Unauthorized: Authentication required'),
    )

    const response = await PATCH(
      new Request('http://localhost:3000/api/users/user-2/role', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'ADMIN' }),
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })
})
