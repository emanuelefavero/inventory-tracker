import { MovementType } from '@/generated/prisma/client'
import { mapErrorToResponse } from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import { parseSearchParamsWithSchema } from '@/lib/api/validation'
import { requireAuth } from '@/lib/auth-helpers'
import { listMovementsQuerySchema } from '@/lib/movements/schemas'
import prisma from '@/lib/prisma'

/**
 * List inventory movements with optional filtering and pagination.
 * Requires an authenticated user (`USER` or `ADMIN`).
 *
 * @example
 * ```ts
 * const response = await fetch('/api/movements?type=OUT&page=1&limit=20', {
 *   credentials: 'include',
 * })
 * const data = await response.json()
 * ```
 */
export async function GET(request: Request) {
  try {
    await requireAuth()
    const query = parseSearchParamsWithSchema(
      new URL(request.url),
      listMovementsQuerySchema,
    )
    const skip = (query.page - 1) * query.limit

    const where = {
      ...(query.type ? { type: query.type as MovementType } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.productId ? { productId: query.productId } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      prisma.inventoryMovement.count({ where }),
    ])

    return ok({
      items: items.map((movement) => ({
        ...movement,
        createdAt: movement.createdAt.toISOString(),
      })),
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
