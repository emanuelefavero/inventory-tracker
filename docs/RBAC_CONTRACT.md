# RBAC Contract + User Flows (MVP)

This document defines the authorization contract for the inventory dashboard MVP.
It is documentation-only for Step 1 and does not introduce runtime code changes.

## 1. Roles

- `ADMIN`: full product CRUD, checkout/return, movement history read, user role management.
- `USER`: read products, checkout/return, movement history read.

Auth baseline for implementation steps:

- Any protected operation requires authenticated user context (`requireAuth`).
- Admin-only operations require admin role (`requireAdmin`).

## 2. Permission Matrix

| Capability | USER | ADMIN |
| --- | --- | --- |
| Access private dashboard | Allow | Allow |
| Read products list/detail | Allow | Allow |
| Create product | Forbid | Allow |
| Update product | Forbid | Allow |
| Delete product | Forbid | Allow |
| Checkout product (`OUT`) | Allow | Allow |
| Return product (`IN`) | Allow | Allow |
| Read movement history | Allow | Allow |
| Read users list | Forbid | Allow |
| Update user role | Forbid | Allow |

## 3. Checkout Flow Contract

### Inputs

- `productId: string`
- `quantity: number` (must be positive integer)
- Authenticated actor (`USER` or `ADMIN`)

### Preconditions

- Actor is authenticated.
- Product exists.
- `quantity > 0`.
- Product stock is sufficient for requested checkout.

### Success Outcome

- Movement record is created with:
  - `type = OUT`
  - `quantity = requested quantity`
  - `userId = actor id`
  - `productId = target product`
- Product quantity is decreased by requested quantity.
- Operation is treated as atomic in later implementation steps.

### Failure Outcomes

- Unauthenticated actor -> `401 AUTH_UNAUTHENTICATED`
- Invalid quantity -> `422 INVALID_MOVEMENT_QUANTITY`
- Unknown product -> `404 PRODUCT_NOT_FOUND`
- Insufficient stock -> `409 INSUFFICIENT_STOCK`
- Unexpected server failure -> `500 INTERNAL_ERROR`

## 4. Return Flow Contract

### Inputs

- `productId: string`
- `quantity: number` (must be positive integer)
- Authenticated actor (`USER` or `ADMIN`)

### Preconditions

- Actor is authenticated.
- Product exists.
- `quantity > 0`.

### Success Outcome

- Movement record is created with:
  - `type = IN`
  - `quantity = returned quantity`
  - `userId = actor id`
  - `productId = target product`
- Product quantity is increased by returned quantity.
- Operation is treated as atomic in later implementation steps.

### Failure Outcomes

- Unauthenticated actor -> `401 AUTH_UNAUTHENTICATED`
- Invalid quantity -> `422 INVALID_MOVEMENT_QUANTITY`
- Unknown product -> `404 PRODUCT_NOT_FOUND`
- Unexpected server failure -> `500 INTERNAL_ERROR`

## 5. Forbidden Actions

### USER forbidden actions

- Create new product.
- Update existing product.
- Delete product.
- Read users list.
- Promote/demote user roles.

Expected behavior for all forbidden USER actions:

- Return `403 AUTH_FORBIDDEN` when authenticated as `USER`.

### Unauthenticated forbidden actions

- Any private dashboard API/action.
- Any product or movement action.
- Any role management action.

Expected behavior:

- Return `401 AUTH_UNAUTHENTICATED`.

## 6. Error Behavior Contract

Error behavior for MVP APIs/actions is standardized as status + app error code:

- `401 AUTH_UNAUTHENTICATED`: no valid authenticated user.
- `403 AUTH_FORBIDDEN`: authenticated user lacks required permission.
- `404 PRODUCT_NOT_FOUND`: product reference does not exist.
- `404 USER_NOT_FOUND`: user reference does not exist.
- `409 INSUFFICIENT_STOCK`: checkout cannot be fulfilled with current stock.
- `422 INVALID_MOVEMENT_QUANTITY`: quantity is missing, non-numeric, zero, or negative.
- `500 INTERNAL_ERROR`: unexpected unhandled failure.

## 7. Non-Goals and Deferred Items (Step 1)

- No route handler implementation.
- No UI role-gating implementation.
- No schema migration or Prisma model changes.
- No Clerk metadata flow changes.
- No `zod` validation layer implementation (planned in Step 3).
- No final endpoint matrix design (planned in Step 2).

## 8. Notes for Step 2+

- Convert this contract into endpoint-level requirements for products, movements, and role updates.
- Define a shared error response shape that includes both status and app error code.
- Keep movement writes and product quantity updates atomic for checkout/return.
