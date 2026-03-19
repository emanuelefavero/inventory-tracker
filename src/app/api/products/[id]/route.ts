import { mapErrorToResponse, notFound } from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import { idParamSchema } from '@/lib/api/schemas'
import { parseJsonWithSchema } from '@/lib/api/validation'
import { requireAdmin } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'
import { updateProductBodySchema } from '@/lib/products/schemas'

type ParamsContext = {
  params: Promise<{ id: string }>
}

/**
 * Update a product by id.
 * Requires an authenticated `ADMIN` user.
 *
 * @example
 * ```ts
 * const response = await fetch('/api/products/prod_123', {
 *   method: 'PATCH',
 *   headers: { 'content-type': 'application/json' },
 *   credentials: 'include',
 *   body: JSON.stringify({ name: 'Mechanical Keyboard', quantity: 12 }),
 * })
 * const data = await response.json()
 * ```
 */
export async function PATCH(request: Request, context: ParamsContext) {
  try {
    await requireAdmin()
    const params = idParamSchema.parse(await context.params)
    const payload = await parseJsonWithSchema(request, updateProductBodySchema)

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!existing) {
      const notFoundError = notFound('PRODUCT_NOT_FOUND', 'Product not found')
      return err(notFoundError.error, notFoundError.status)
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: payload,
    })

    return ok({
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}

/**
 * Delete a product by id.
 * Requires an authenticated `ADMIN` user.
 *
 * @example
 * ```ts
 * const response = await fetch('/api/products/prod_123', {
 *   method: 'DELETE',
 *   credentials: 'include',
 * })
 * const data = await response.json()
 * ```
 */
export async function DELETE(_request: Request, context: ParamsContext) {
  try {
    await requireAdmin()
    const params = idParamSchema.parse(await context.params)

    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!existing) {
      const notFoundError = notFound('PRODUCT_NOT_FOUND', 'Product not found')
      return err(notFoundError.error, notFoundError.status)
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return ok({ deleted: true, id: params.id })
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}
