import { z } from 'zod'

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
