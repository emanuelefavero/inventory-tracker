import { Prisma } from '@/generated/prisma/client'
import { PageInfo } from '@/lib/api/types'
import prisma from '@/lib/prisma'
import { listProductsQuerySchema } from '@/lib/products/schemas'
import { ProductDetail } from '@/lib/products/types'
import { z } from 'zod'

export type ListProductsInput = z.input<typeof listProductsQuerySchema>

export type ListProductsResult = {
  items: ProductDetail[]
  pageInfo: PageInfo
}

export async function listProducts(
  input: ListProductsInput = {},
): Promise<ListProductsResult> {
  const query = listProductsQuerySchema.parse(input)
  const skip = (query.page - 1) * query.limit
  const where = buildWhereClause(query)
  const orderBy = buildOrderByClause(query)

  const [items, totalItems] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ])

  return {
    items: items.map((product) => serializeProduct(product)),
    pageInfo: {
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / query.limit)),
    },
  }
}

function buildWhereClause(
  query: z.infer<typeof listProductsQuerySchema>,
): Prisma.ProductWhereInput {
  return {
    ...(query.category ? { category: query.category } : {}),
    ...(query.search
      ? {
          OR: [
            { sku: { contains: query.search, mode: 'insensitive' } },
            { name: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }
}

function buildOrderByClause(
  query: z.infer<typeof listProductsQuerySchema>,
): Prisma.ProductOrderByWithRelationInput {
  if (query.sortBy) {
    return {
      [query.sortBy]: query.sortOrder ?? 'asc',
    }
  }

  return { createdAt: 'desc' }
}

function serializeProduct(
  product: Prisma.ProductGetPayload<Record<string, never>>,
): ProductDetail {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
