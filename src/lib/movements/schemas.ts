import { z } from 'zod'

export const checkoutBodySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be greater than zero'),
})

export const returnBodySchema = checkoutBodySchema

export const listMovementsQuerySchema = z.object({
  type: z.enum(['OUT', 'IN']).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  userId: z.string().optional(),
  productId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
