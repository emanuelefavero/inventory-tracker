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
- Toast notifications for mutation feedback
- Empty state for first-time use
- Route-local Zustand store for UI orchestration (dialogs + selected row targets)
- Debounced search with `useTransition` for non-blocking URL updates
- Accessibility: `aria-label` on icon buttons, semantic table HTML, keyboard-navigable actions
- Responsive layout basics (horizontal scroll table, stacked toolbar on mobile)
- Unit tests for page/store/client orchestration

### Out of Scope (Step 5)

- Global app-wide Zustand store
- TanStack Query / TanStack Table
- Movement flows (Step 6)
- Analytics widgets (Step 8)
- Role management UI (Step 9)
- Full authenticated UI E2E with Clerk test auth setup
- Skeleton loading components (deferred to Step 10)
- SKU uniqueness error handling at API level (deferred to Step 10)
- Tooltip hints on table action buttons (deferred to Step 10)

---

## 3. Architecture Decisions (Locked)

1. **Route:** `/admin/products`
2. **CRUD UX:** Dialog-based create/edit + confirmation dialog for delete
3. **Pagination:** Previous/next controls with "Page X of Y" display + total count
4. **Data fetching:** Server-first with Next.js Server Components, wrapped in `<Suspense>`
5. **Zustand usage:** Route-local UI state only (no server data caching)
6. **Mutation feedback:** Toast notifications via `sonner` for success/error
7. **Form validation:** Reuse existing zod schemas from `src/lib/api/schemas.ts` with `zodResolver`
8. **Search:** Debounced input (300ms) with `useTransition` for non-blocking URL updates
9. **Table row actions:** Dropdown menu per row (reuse existing `dropdown-menu` component)

### Why this architecture

- Preserves Next.js defaults: server data first, client interactivity where needed.
- Uses Zustand only where it provides value (avoiding prop drilling for modal orchestration).
- Reuses existing validation schemas as single source of truth (no duplication).
- Avoids overengineering for MVP.

---

## 4. Data Flow

## 4.1 List (Server Path)

1. Request to `/admin/products?search=...&sortBy=...&sortOrder=...&page=...&limit=...`
2. Server page parses query params
3. Server query function reads products from Prisma
4. Page wraps data-fetching in `<Suspense fallback={<div>Loading...</div>}>` for streaming
5. Page renders client shell with initial data + current query state
6. If no products exist, renders empty state with "Create your first product" CTA

## 4.2 Mutations (Client Path)

1. User opens create/edit/delete dialogs (controlled by Zustand store)
2. Form dialogs use `react-hook-form` with `zodResolver` pointing to existing schemas from `src/lib/api/schemas.ts` (`createProductBodySchema` / `updateProductBodySchema`)
3. Submit button shows loading spinner + disabled state during API call (prevents double-submit)
4. Client calls existing API endpoints via typed wrappers in `src/lib/api/products-client.ts`:
   - `POST /api/products`
   - `PATCH /api/products/:id`
   - `DELETE /api/products/:id`
5. On success:
   - Toast success message via `sonner` (e.g., "Product created")
   - Close dialog via Zustand `closeDialogs()`
   - Call `router.refresh()` to re-render server data
6. On error:
   - Toast error message with safe user-facing text (e.g., "Failed to create product")
   - Keep dialog open so user can retry or fix input

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
- Wrap store with `devtools` middleware for Redux DevTools debugging in development

## 5.3 Consumer Guidelines

- Use **selectors** in consuming components to prevent unnecessary re-renders:
  - `useProductsAdminUIStore((s) => s.formMode)` — not destructuring the whole store
  - Use `useShallow` from `zustand/react/shallow` when selecting multiple fields

## 5.4 Explicit Non-Responsibilities

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
- `src/app/admin/products/_components/products-empty-state.tsx`

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
- `label`
- `table`
- `dialog`
- `alert-dialog`
- `select`
- `card`
- `skeleton`
- `badge`
- `sonner`

## 7.2 Components already present and reused

- `button`
- `dropdown-menu`

## 7.3 Supporting dependencies

- `zustand`
- `react-hook-form`
- `@hookform/resolvers`
- `sonner`

---

## 8. Search & Transition Behavior

### Debounced Search

- Search input updates a local `useState` value immediately for responsive typing
- After 300ms of no typing, the debounced value triggers a URL param update via `router.push()`
- Wrap `router.push()` in `startTransition()` so the current UI remains interactive while the server re-renders

### Sort & Page Changes

- Sort column/order changes update URL params immediately (no debounce needed)
- Page prev/next changes update URL params immediately
- All URL param changes wrapped in `startTransition()` for non-blocking updates
- `isPending` from `useTransition` can drive a subtle loading indicator (e.g., reduced table opacity)

---

## 9. URL Query Contract for `/admin/products`

- `search?: string`
- `sortBy?: 'sku' | 'name' | 'category' | 'quantity' | 'createdAt' | 'updatedAt'`
- `sortOrder?: 'asc' | 'desc'`
- `page?: number`
- `limit?: number` (default `20`)

### Pagination Display

The API returns `pageInfo` with `page`, `limit`, `totalCount`, `totalPages`. Display:

- "Showing X–Y of Z products" text
- Previous / Next buttons (disabled at bounds)

---

## 10. API Contract Usage (No changes required)

Use existing API route handlers exactly as implemented:

- `GET /api/products` (already supports search/sort/page/limit)
- `POST /api/products`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

### Form Validation Reuse

The `ProductFormDialog` must import and reuse existing zod schemas directly from `src/lib/api/schemas.ts`:

- `createProductBodySchema` for create mode
- `updateProductBodySchema` for edit mode

This ensures a single source of truth for validation rules between client forms and server endpoints.

### Type-Safe API Client

`src/lib/api/products-client.ts` must return typed `ApiResult<T>` responses (matching the discriminated union from `src/lib/api/types.ts`) so consumers can handle success/error branches with type safety.

No backend contract changes are required for Step 5.

---

## 11. Accessibility Requirements

- All icon buttons (edit, delete, search, sort, table row actions) must have `aria-label` attributes
- Use `size="icon"` on icon-only buttons for 44px minimum touch targets (WCAG 2.1 AAA)
- Delete actions use `AlertDialog` (not `Dialog`) for destructive confirmation with proper focus management
- Table uses semantic HTML via shadcn `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableCell` components
- Table row action dropdown is keyboard-navigable (provided by Radix `DropdownMenu`)
- Form fields use `FormControl` wrapper for proper ARIA linkage between label, input, and error message

---

## 12. Responsive Design

Minimal responsive awareness for MVP:

- **Table:** Wrap in `overflow-x-auto` container for horizontal scroll on narrow viewports
- **Toolbar:** Use `flex-col sm:flex-row` to stack search input and action buttons vertically on mobile
- **Dialogs:** Shadcn dialogs are responsive by default (full-width on mobile, constrained on desktop)
- **Buttons:** Full width on mobile (`w-full sm:w-auto`) where appropriate

---

## 13. Testing Strategy

## 13.1 Unit tests

1. Admin page:
   - Admin user can access page
   - Non-admin path is blocked in UI rendering path
2. Zustand store:
   - Actions set/reset dialog states correctly
3. Client orchestrator:
   - Search debounce triggers URL update after delay
   - Sort/page changes update URL state immediately
   - Mutation success triggers toast + close + refresh
   - Mutation errors show toast with safe error message
4. API client wrappers:
   - Correct handling of `ApiResult` success/error
5. Empty state:
   - Renders when product list is empty
   - CTA button triggers create dialog

## 13.2 E2E

- Keep current API smoke tests unchanged for Step 5.
- Authenticated full UI E2E with Clerk can be added later when auth test setup is stable.

---

## 14. Risks and Mitigations

1. **Risk:** Overusing Zustand
   **Mitigation:** Restrict Zustand to dialog/selection orchestration only. Use selectors to minimize re-renders.

2. **Risk:** Client/server boundary drift
   **Mitigation:** Keep list fetching only on server; use `router.refresh()` after mutations.

3. **Risk:** Step inflation
   **Mitigation:** Defer advanced tables, global state, skeleton components, and analytics to future steps.

4. **Risk:** Validation drift between client forms and API
   **Mitigation:** Reuse existing zod schemas from `src/lib/api/schemas.ts` in form `zodResolver`.

---

## 15. Acceptance Criteria Mapping

From `Step 5 — Products CRUD (Admin)`:

1. **Admin can create, edit, delete, and list products**
   - Covered by page + dialogs + mutation flows + server list fetch.
   - Mutations provide toast feedback on success and error.
   - Empty state guides first-time users to create their first product.

2. **Product table supports search/sort**
   - Covered by toolbar controls bound to URL query and server query parsing.
   - Search is debounced (300ms) with `useTransition` for non-blocking updates.

---

## 16. Implementation Order (when execution starts)

1. Install dependencies (`zustand`, `react-hook-form`, `@hookform/resolvers`, `sonner`)
2. Add required shadcn components (`input`, `form`, `label`, `table`, `dialog`, `alert-dialog`, `select`, `card`, `skeleton`, `badge`, `sonner`)
3. Implement API client wrappers (`src/lib/api/products-client.ts`)
4. Implement server query function (`src/lib/products/queries.ts`)
5. Build `/admin/products/page.tsx` with RBAC gate + Suspense boundary + initial data
6. Implement route-local Zustand store with devtools
7. Build client composition + toolbar (with debounced search) + table (with row action dropdown) + dialogs (with toast feedback) + empty state
8. Add header admin link
9. Add unit tests
10. Run checks (`npm run test`, `npm run lint`, optional `npm run build`)
11. Update execution plan evidence/changelog

---

## 17. Deferred Improvements (Step 10 — UX Hardening)

The following improvements are planned but intentionally deferred to avoid Step 5 inflation:

1. **Skeleton Fallback Component**
   - Create `products-table-skeleton.tsx` with skeleton rows matching the table layout
   - Replace the simple `<Suspense fallback={<div>Loading...</div>}>` with the skeleton component
   - Provides a polished loading experience during server data fetching

2. **SKU Uniqueness Error Handling**
   - Catch Prisma `P2002` unique constraint error in the `POST /api/products` handler
   - Return a specific `DUPLICATE_SKU` error code (or reuse `INVALID_REQUEST_BODY` with field detail)
   - Map the error in `products-client.ts` to show a field-level form error ("SKU already exists")
   - Currently falls through to `INTERNAL_ERROR` (500) — functional but not user-friendly

3. **Tooltip on Table Row Actions**
   - Add shadcn `tooltip` component to the icon button in each table row's action dropdown trigger
   - Provides hover hint (e.g., "Product actions") for discoverability

---

## 18. Notes

- This plan intentionally avoids global state and heavy data libraries in Step 5.
- The architecture keeps MVP speed while staying clean, scalable, and interview-ready.
- Toast notifications and loading states provide professional mutation feedback without complexity.
- Reusing existing zod schemas eliminates validation drift between client and server.
- Deferred items in Section 17 are tracked for Step 10 (UX Hardening) to ensure nothing is forgotten.
