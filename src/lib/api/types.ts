export type ApiErrorCode =
  | 'AUTH_UNAUTHENTICATED'
  | 'AUTH_FORBIDDEN'
  | 'PRODUCT_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_MOVEMENT_QUANTITY'
  | 'INVALID_REQUEST_BODY'
  | 'INTERNAL_ERROR'

export type ApiError = {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }

export type PageInfo = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}
