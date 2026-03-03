import { MovementType } from '@/generated/prisma/client'
import {
  conflict,
  invalidMovementQuantity,
  mapErrorToResponse,
  notFound,
} from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import { checkoutBodySchema } from '@/lib/api/schemas'
import { requireAuth } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'

/**
 * Perform a checkout (`OUT`) movement.
 * Atomically decrements product quantity and creates movement history.
 * Requires an authenticated user (`USER` or `ADMIN`).
 *
 * @example
 * ```ts
 * const response = await fetch('/api/movements/checkout', {
 *   method: 'POST',
 *   headers: { 'content-type': 'application/json' },
 *   credentials: 'include',
 *   body: JSON.stringify({ productId: 'prod_123', quantity: 2 }),
 * })
 * const data = await response.json()
 * ```
 */
export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const parsed = checkoutBodySchema.safeParse(body)

    if (!parsed.success) {
      const validationError = invalidMovementQuantity(
        'Quantity must be a positive integer',
      )
      return err(validationError.error, validationError.status)
    }

    const payload = parsed.data

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: payload.productId },
      })

      if (!product) {
        return { kind: 'not_found' as const }
      }

      if (product.quantity < payload.quantity) {
        return { kind: 'insufficient_stock' as const }
      }

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: payload.quantity } },
      })

      const movement = await tx.inventoryMovement.create({
        data: {
          type: MovementType.OUT,
          quantity: payload.quantity,
          userId: user.id,
          productId: product.id,
        },
      })

      return {
        kind: 'success' as const,
        movement,
        product: updatedProduct,
      }
    })

    if (result.kind === 'not_found') {
      const mapped = notFound('PRODUCT_NOT_FOUND', 'Product not found')
      return err(mapped.error, mapped.status)
    }

    if (result.kind === 'insufficient_stock') {
      const mapped = conflict(
        'INSUFFICIENT_STOCK',
        'Not enough stock for checkout',
      )
      return err(mapped.error, mapped.status)
    }

    return ok({
      movement: {
        ...result.movement,
        createdAt: result.movement.createdAt.toISOString(),
      },
      product: {
        ...result.product,
        createdAt: result.product.createdAt.toISOString(),
        updatedAt: result.product.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}
