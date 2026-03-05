# Step 5 Detailed Plan — Products CRUD (Admin)

**Date:** 2026-03-05  
**Execution Plan Reference:** `docs/MVP_DASHBOARD_EXECUTION_PLAN.md`  
**Step:** `Step 5 — Products CRUD (Admin)`

## 1. Purpose

Implement a professional admin-only products management experience for the MVP:

- List products
- Search products
- Sort products
- Create product
- Edit product
- Delete product

This step must stay lean and interview-quality:

- Clean architecture
- Clear server/client boundaries
- Readable components
- No unnecessary abstractions

---

## 2. Scope

### In Scope

- New admin route at `/admin/products`
- Server-rendered products list (RSC-first)
- CRUD mutations through existing API route handlers
- Search/sort/pagination controls
- Route-local Zustand store for UI orchestration (dialogs + selected row targets)
- Unit tests for page/store/client orchestration

### Out of Scope (Step 5)

- Global app-wide Zustand store
- TanStack Query / TanStack Table
- Movement flows (Step 6)
- Analytics widgets (Step 8)
- Role management UI (Step 9)
- Full authenticated UI E2E with Clerk test auth setup

---

## 3. Architecture Decisions (Locked)

1. **Route:** `/admin/products`
2. **CRUD UX:** Dialog-based create/edit + confirmation dialog for delete
3. **Pagination:** Basic previous/next controls
4. **Data fetching:** Server-first with Next.js Server Components
5. **Zustand usage:** Route-local UI state only (no server data caching)

### Why this architecture

- Preserves Next.js defaults: server data first, client interactivity where needed.
- Uses Zustand only where it provides value (avoiding prop drilling for modal orchestration).
- Avoids overengineering for MVP.

---

## 4. Data Flow

## 4.1 List (Server Path)

1. Request to `/admin/products?search=...&sortBy=...&sortOrder=...&page=...&limit=...`
2. Server page parses query params
3. Server query function reads products from Prisma
4. Page renders client shell with initial data + current query state

## 4.2 Mutations (Client Path)

1. User opens create/edit/delete dialogs
2. Client calls existing API endpoints:
   - `POST /api/products`
   - `PATCH /api/products/:id`
   - `DELETE /api/products/:id`
3. On success, client closes dialog and calls `router.refresh()`
4. Server re-renders list with latest data

---

## 5. Zustand Plan

## 5.1 Store Scope

Create a route-local store at:

`src/app/admin/products/_store/use-products-admin-ui-store.ts`

## 5.2 Store Responsibilities

- Control form dialog mode (`create | edit | null`)
- Track selected product for edit
- Track selected product for delete confirmation
- Expose focused actions:
  - `openCreate()`
  - `openEdit(product)`
  - `openDelete(product)`
  - `closeDialogs()`

## 5.3 Explicit Non-Responsibilities

- No product list state
- No API request caching
- No cross-route shared state
- No persistence middleware

---

## 6. Planned File Changes

## 6.1 Create

### Route + composition

- `src/app/admin/products/page.tsx`
- `src/app/admin/products/_components/products-admin-client.tsx`

### UI components

- `src/app/admin/products/_components/products-toolbar.tsx`
- `src/app/admin/products/_components/products-table.tsx`
- `src/app/admin/products/_components/product-form-dialog.tsx`
- `src/app/admin/products/_components/delete-product-dialog.tsx`

### Zustand

- `src/app/admin/products/_store/use-products-admin-ui-store.ts`

### Server query layer

- `src/lib/products/queries.ts`

### API client wrappers

- `src/lib/api/products-client.ts`

### Tests

- `src/app/admin/products/page.test.tsx`
- `src/app/admin/products/_components/products-admin-client.test.tsx`
- `src/app/admin/products/_store/use-products-admin-ui-store.test.ts`
- `src/lib/api/products-client.test.ts`

## 6.2 Modify

- `src/components/layout/header.tsx` (admin navigation link to `/admin/products`)
- `docs/MVP_DASHBOARD_EXECUTION_PLAN.md` (step status/evidence/changelog when implementation is completed)

---

## 7. Shadcn/UI Component Plan

## 7.1 Components to add

- `input`
- `form`
- `table`
- `dialog`
- `alert-dialog`
- `select`
- `card`
- `skeleton`
- `alert`
- `badge`

## 7.2 Components already present and reused

- `button`
- `dropdown-menu`

## 7.3 Supporting dependencies

- `zustand`
- `react-hook-form`
- `@hookform/resolvers`

---

## 8. URL Query Contract for `/admin/products`

- `search?: string`
- `sortBy?: 'sku' | 'name' | 'category' | 'quantity' | 'createdAt' | 'updatedAt'`
- `sortOrder?: 'asc' | 'desc'`
- `page?: number`
- `limit?: number` (default `20`)

---

## 9. API Contract Usage (No changes required)

Use existing API route handlers exactly as implemented:

- `GET /api/products` (already supports search/sort/page/limit)
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

No backend contract changes are required for Step 5.

---

## 10. Testing Strategy

## 10.1 Unit tests

1. Admin page:
   - Admin user can access page
   - Non-admin path is blocked in UI rendering path
2. Zustand store:
   - Actions set/reset dialog states correctly
3. Client orchestrator:
   - Search/sort update URL state
   - Mutation success triggers close + refresh
   - Mutation errors show safe error message
4. API client wrappers:
   - Correct handling of `ApiResult` success/error

## 10.2 E2E

- Keep current API smoke tests unchanged for Step 5.
- Authenticated full UI E2E with Clerk can be added later when auth test setup is stable.

---

## 11. Risks and Mitigations

1. **Risk:** Overusing Zustand  
   **Mitigation:** Restrict Zustand to dialog/selection orchestration only.

2. **Risk:** Client/server boundary drift  
   **Mitigation:** Keep list fetching only on server; use `router.refresh()` after mutations.

3. **Risk:** Step inflation  
   **Mitigation:** Defer advanced tables, global state, and analytics to future steps.

---

## 12. Acceptance Criteria Mapping

From `Step 5 — Products CRUD (Admin)`:

1. **Admin can create, edit, delete, and list products**
   - Covered by page + dialogs + mutation flows + server list fetch.

2. **Product table supports search/sort**
   - Covered by toolbar controls bound to URL query and server query parsing.

---

## 13. Implementation Order (when execution starts)

1. Add required shadcn components + dependencies
2. Implement server query function (`src/lib/products/queries.ts`)
3. Build `/admin/products/page.tsx` with RBAC gate + initial data
4. Implement route-local Zustand store
5. Build client composition + toolbar + table + dialogs
6. Add header admin link
7. Add unit tests
8. Run checks (`npm run test`, `npm run lint`, optional `npm run build`)
9. Update execution plan evidence/changelog

---

## 14. Notes

- This plan intentionally avoids global state and heavy data libraries in Step 5.
- The architecture keeps MVP speed while staying clean, scalable, and interview-ready.
