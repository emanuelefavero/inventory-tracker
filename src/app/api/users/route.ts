import { mapErrorToResponse } from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import { listUsersQuerySchema } from '@/lib/api/schemas'
import { parseSearchParamsWithSchema } from '@/lib/api/validation'
import { requireAdmin } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

/**
 * List users for role management with optional filters and pagination.
 * Requires an authenticated `ADMIN` user.
 *
 * @example
 * ```ts
 * const response = await fetch('/api/users?role=USER&page=1&limit=20', {
 *   credentials: 'include',
 * })
 * const data = await response.json()
 * ```
 */
export async function GET(request: Request) {
  try {
    await requireAdmin()
    const query = parseSearchParamsWithSchema(
      new URL(request.url),
      listUsersQuerySchema,
    )
    const skip = (query.page - 1) * query.limit
    const where = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? {
            OR: [
              {
                email: { contains: query.search, mode: 'insensitive' as const },
              },
              {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.user.count({ where }),
    ])

    return ok({
      items,
      pageInfo: {
        page: query.page,
        limit: query.limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / query.limit)),
      },
    })
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}
