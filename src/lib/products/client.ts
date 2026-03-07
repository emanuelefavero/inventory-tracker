import { ApiResult } from '@/lib/api/types'
import {
  createProductBodySchema,
  updateProductBodySchema,
} from '@/lib/products/schemas'
import { ProductDetail } from '@/lib/products/types'
import { z } from 'zod'

export type CreateProductInput = z.input<typeof createProductBodySchema>
export type UpdateProductInput = z.input<typeof updateProductBodySchema>

export type ProductMutationResult = {
  product: ProductDetail
}

export type DeleteProductResult = {
  deleted: true
  id: string
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ApiResult<ProductMutationResult>> {
  return requestProductMutation('/api/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
): Promise<ApiResult<ProductMutationResult>> {
  return requestProductMutation(`/api/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteProduct(
  id: string,
): Promise<ApiResult<DeleteProductResult>> {
  return requestProductMutation(`/api/products/${id}`, {
    method: 'DELETE',
  })
}

async function requestProductMutation<T>(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(init.headers ?? {}),
      },
    })

    const payload: unknown = await response.json()

    if (isApiResult<T>(payload)) {
      return payload
    }
  } catch {
    // Fall through to the safe internal-error result returned below.
  }

  return {
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    },
  }
}

function isApiResult<T>(value: unknown): value is ApiResult<T> {
  if (!value || typeof value !== 'object' || !('ok' in value)) {
    return false
  }

  if (value.ok === true) {
    return 'data' in value
  }

  return (
    value.ok === false &&
    'error' in value &&
    !!value.error &&
    typeof value.error === 'object' &&
    'code' in value.error &&
    'message' in value.error
  )
}
