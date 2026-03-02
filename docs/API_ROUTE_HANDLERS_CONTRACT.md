# API Design Contract (Route Handlers) - MVP

This document defines the API contract for MVP route handlers in Next.js App Router.
It finalizes endpoint coverage, per-endpoint auth rules, and a standard response shape.

Scope:

- Design only for Step 2.
- Runtime endpoint implementation is handled in later steps.
- `zod` runtime validation is intentionally deferred to Step 3.

## 1. Routing Surface

All endpoints are private and live under `app/api/**/route.ts`.

Planned routes:

- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/movements`
- `POST /api/movements/checkout`
- `POST /api/movements/return`
- `GET /api/users`
- `PATCH /api/users/:id/role`

## 2. Standard Response Shape

MVP API responses use a discriminated union `Result` envelope.
This keeps response handling cohesive in both server and client code.

```ts
export type ApiErrorCode =
  | 'AUTH_UNAUTHENTICATED'
  | 'AUTH_FORBIDDEN'
  | 'PRODUCT_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_MOVEMENT_QUANTITY'
  | 'INTERNAL_ERROR'

export type ApiError = {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError }
```

Status mapping:

- Success: `200`, `201`, `204` (when no payload is returned, API may still use `200` with lightweight data for consistency).
- Error: `401`, `403`, `404`, `409`, `422`, `500`.

Example JSON responses:

```json
{ "ok": true, "data": { "items": [] } }
```

```json
{
  "ok": false,
  "error": {
    "code": "AUTH_FORBIDDEN",
    "message": "Admin access required"
  }
}
```

## 3. Endpoint Matrix (Auth + Role + Contract)

| Method   | Path                      | Auth Required | Role              | Purpose                        | Request Contract                                                                      | Success Response                                                | Error Codes                                                                                                                        |
| -------- | ------------------------- | ------------- | ----------------- | ------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `GET`    | `/api/products`           | Yes           | `USER` or `ADMIN` | List products                  | Query params (optional): `search`, `category`, `sortBy`, `sortOrder`, `page`, `limit` | `ApiResult<{ items: ProductSummary[]; pageInfo: PageInfo }>`    | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `INTERNAL_ERROR`                                                                         |
| `POST`   | `/api/products`           | Yes           | `ADMIN`           | Create product                 | Body: `{ sku, name, category, quantity? }`                                            | `ApiResult<{ product: ProductDetail }>`                         | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `INTERNAL_ERROR`                                                                         |
| `PATCH`  | `/api/products/:id`       | Yes           | `ADMIN`           | Update product                 | Body (partial): `{ sku?, name?, category?, quantity? }`                               | `ApiResult<{ product: ProductDetail }>`                         | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `PRODUCT_NOT_FOUND`, `INTERNAL_ERROR`                                                    |
| `DELETE` | `/api/products/:id`       | Yes           | `ADMIN`           | Delete product                 | No body                                                                               | `ApiResult<{ deleted: true; id: string }>`                      | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `PRODUCT_NOT_FOUND`, `INTERNAL_ERROR`                                                    |
| `GET`    | `/api/movements`          | Yes           | `USER` or `ADMIN` | List movement history          | Query params (optional): `type`, `from`, `to`, `userId`, `productId`, `page`, `limit` | `ApiResult<{ items: MovementItem[]; pageInfo: PageInfo }>`      | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `INTERNAL_ERROR`                                                                         |
| `POST`   | `/api/movements/checkout` | Yes           | `USER` or `ADMIN` | Checkout inventory (`OUT`)     | Body: `{ productId, quantity }`                                                       | `ApiResult<{ movement: MovementItem; product: ProductDetail }>` | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `PRODUCT_NOT_FOUND`, `INVALID_MOVEMENT_QUANTITY`, `INSUFFICIENT_STOCK`, `INTERNAL_ERROR` |
| `POST`   | `/api/movements/return`   | Yes           | `USER` or `ADMIN` | Return inventory (`IN`)        | Body: `{ productId, quantity }`                                                       | `ApiResult<{ movement: MovementItem; product: ProductDetail }>` | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `PRODUCT_NOT_FOUND`, `INVALID_MOVEMENT_QUANTITY`, `INTERNAL_ERROR`                       |
| `GET`    | `/api/users`              | Yes           | `ADMIN`           | List users for role management | Query params (optional): `search`, `role`, `page`, `limit`                            | `ApiResult<{ items: UserSummary[]; pageInfo: PageInfo }>`       | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `INTERNAL_ERROR`                                                                         |
| `PATCH`  | `/api/users/:id/role`     | Yes           | `ADMIN`           | Update user role               | Body: `{ role: 'USER'                                                                 | 'ADMIN' }`                                                      | `ApiResult<{ user: UserSummary }>`                                                                                                 | `AUTH_UNAUTHENTICATED`, `AUTH_FORBIDDEN`, `USER_NOT_FOUND`, `INTERNAL_ERROR` |

## 4. Shared Contract Types (Design-Level)

```ts
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
```

## 5. Auth and RBAC Enforcement Rules

- All route handlers must authenticate first (`requireAuth`).
- Admin-only endpoints must call `requireAdmin`.
- Shared read endpoints for products/movements are available to both roles.
- Role update endpoint is admin-only.

## 6. Error Handling Rules

- Every failure response must use `ApiResult<never>` with `ok: false`.
- `error.code` must be one of `ApiErrorCode`.
- `error.message` is human-readable and safe for UI to display.
- `error.details` is optional for debugging and field-level context.
- HTTP status and `error.code` must be aligned (no mismatched combinations).

## 7. Validation Strategy (Deferred to Step 3)

- Step 2 defines payload contracts only.
- Step 3 will implement runtime validation with `zod`.
- Planned validation failures should map to:
  - `422 INVALID_MOVEMENT_QUANTITY` for checkout/return quantity issues.
  - Additional `422` validation codes can be introduced in Step 3 if needed.

## 8. Implementation Notes for Next Steps

- Step 3: add `zod` schemas for all mutating endpoints (`POST`, `PATCH`, `DELETE` as needed).
- Step 4+: implement route handlers at `src/app/api/**/route.ts` using this contract.
- Keep DB writes for checkout/return atomic in Step 5.
