import { mapErrorToResponse } from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import {
  createProductBodySchema,
  listProductsQuerySchema,
} from '@/lib/api/schemas'
import {
  parseJsonWithSchema,
  parseSearchParamsWithSchema,
} from '@/lib/api/validation'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    await requireAuth()

    const query = parseSearchParamsWithSchema(
      new URL(request.url),
      listProductsQuerySchema,
    )
    const skip = (query.page - 1) * query.limit
    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'asc' }
      : { createdAt: 'desc' as const }

    const where = {
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { sku: { contains: query.search, mode: 'insensitive' as const } },
              {
                name: { contains: query.search, mode: 'insensitive' as const },
              },
            ],
          }
        : {}),
    }

    const [items, totalItems] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.product.count({ where }),
    ])

    return ok({
      items: items.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
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

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const payload = await parseJsonWithSchema(request, createProductBodySchema)

    const product = await prisma.product.create({
      data: payload,
    })

    return ok(
      {
        product: {
          ...product,
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString(),
        },
      },
      201,
    )
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}
