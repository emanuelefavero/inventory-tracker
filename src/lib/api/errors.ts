import { Prisma } from '@/generated/prisma/client'
import { ApiError } from '@/lib/api/types'
import { ZodError } from 'zod'

type ErrorResponse = {
  status: number
  error: ApiError
}

export function mapErrorToResponse(error: unknown): ErrorResponse {
  if (error instanceof SyntaxError) {
    return {
      status: 422,
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Request body must be valid JSON',
      },
    }
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      error: {
        code: 'INVALID_REQUEST_BODY',
        message: 'Request body validation failed',
        details: {
          fields: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
      },
    }
  }

  if (isUnauthorizedError(error)) {
    return {
      status: 401,
      error: {
        code: 'AUTH_UNAUTHENTICATED',
        message: 'Authentication required',
      },
    }
  }

  if (isForbiddenError(error)) {
    return {
      status: 403,
      error: {
        code: 'AUTH_FORBIDDEN',
        message: 'Forbidden',
      },
    }
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return {
        status: 404,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Requested resource was not found',
        },
      }
    }
  }

  return {
    status: 500,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    },
  }
}

export function notFound(
  code: 'PRODUCT_NOT_FOUND' | 'USER_NOT_FOUND',
  message: string,
): ErrorResponse {
  return { status: 404, error: { code, message } }
}

export function conflict(
  code: 'INSUFFICIENT_STOCK',
  message: string,
): ErrorResponse {
  return { status: 409, error: { code, message } }
}

export function invalidMovementQuantity(message: string): ErrorResponse {
  return {
    status: 422,
    error: {
      code: 'INVALID_MOVEMENT_QUANTITY',
      message,
    },
  }
}

function isUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes('unauthorized')
  )
}

function isForbiddenError(error: unknown): boolean {
  return (
    error instanceof Error && error.message.toLowerCase().includes('forbidden')
  )
}
