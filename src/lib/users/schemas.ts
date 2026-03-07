import { z } from 'zod'

export const roleBodySchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
})

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})
