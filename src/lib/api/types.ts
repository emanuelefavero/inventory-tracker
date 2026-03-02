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

export type ProductSummary = {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
}

export type ProductDetail = ProductSummary & {
  createdAt: string
  updatedAt: string
}

export type MovementItem = {
  id: string
  type: 'OUT' | 'IN'
  quantity: number
  createdAt: string
  userId: string
  productId: string
}

export type UserSummary = {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
}
