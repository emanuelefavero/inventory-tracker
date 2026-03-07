import { mapErrorToResponse, notFound } from '@/lib/api/errors'
import { err, ok } from '@/lib/api/response'
import { idParamSchema } from '@/lib/api/schemas'
import { parseJsonWithSchema } from '@/lib/api/validation'
import { requireAdmin, updateUserRole } from '@/lib/auth-helpers'
import prisma from '@/lib/prisma'
import { roleBodySchema } from '@/lib/users/schemas'

type ParamsContext = {
  params: Promise<{ id: string }>
}

/**
 * Update a user's role (`USER` or `ADMIN`) by id.
 * Requires an authenticated `ADMIN` user.
 *
 * @example
 * ```ts
 * const response = await fetch('/api/users/user_123/role', {
 *   method: 'PATCH',
 *   headers: { 'content-type': 'application/json' },
 *   credentials: 'include',
 *   body: JSON.stringify({ role: 'ADMIN' }),
 * })
 * const data = await response.json()
 * ```
 */
export async function PATCH(request: Request, context: ParamsContext) {
  try {
    await requireAdmin()
    const params = idParamSchema.parse(await context.params)
    const payload = await parseJsonWithSchema(request, roleBodySchema)

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!targetUser) {
      const mapped = notFound('USER_NOT_FOUND', 'User not found')
      return err(mapped.error, mapped.status)
    }

    await updateUserRole(params.id, payload.role)

    const updatedUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!updatedUser) {
      const mapped = notFound('USER_NOT_FOUND', 'User not found')
      return err(mapped.error, mapped.status)
    }

    return ok({ user: updatedUser })
  } catch (error) {
    const mapped = mapErrorToResponse(error)
    return err(mapped.error, mapped.status)
  }
}
