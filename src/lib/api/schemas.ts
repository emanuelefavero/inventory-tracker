import { z } from 'zod'

export const idParamSchema = z.object({
  id: z.string().min(1, 'id is required'),
})

export const createProductBodySchema = z.object({
  sku: z.string().trim().min(1, 'sku is required'),
  name: z.string().trim().min(1, 'name is required'),
  category: z.string().trim().min(1, 'category is required'),
  quantity: z.number().int().nonnegative().default(0),
})

export const updateProductBodySchema = z
  .object({
    sku: z.string().trim().min(1, 'sku cannot be empty').optional(),
    name: z.string().trim().min(1, 'name cannot be empty').optional(),
    category: z.string().trim().min(1, 'category cannot be empty').optional(),
    quantity: z.number().int().nonnegative().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided',
  })

export const checkoutBodySchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be greater than zero'),
})

export const returnBodySchema = checkoutBodySchema

export const roleBodySchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

export const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z
    .enum(['sku', 'name', 'category', 'quantity', 'createdAt', 'updatedAt'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const listMovementsQuerySchema = z.object({
  type: z.enum(['OUT', 'IN']).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
  userId: z.string().optional(),
  productId: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
