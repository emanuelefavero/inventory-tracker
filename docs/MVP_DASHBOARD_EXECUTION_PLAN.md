# MVP Dashboard Execution Plan

This file is the single source of truth for implementing the private inventory dashboard MVP.

## How To Use This Plan

- Work one step at a time.
- Keep exactly one active implementation step in `IN_PROGRESS`.
- After completing any step, immediately update this file before ending work.
- Add evidence (files touched, PR link, commit hash, screenshots) for each completed step.

## Step Update Protocol (Mandatory)

For every step card below, maintain the following fields:

- `Status`: `TODO` | `IN_PROGRESS` | `BLOCKED` | `DONE`
- `Owner`: person/agent executing the step
- `Started on`: YYYY-MM-DD (when moved to `IN_PROGRESS`)
- `Completed on`: YYYY-MM-DD (when moved to `DONE`)
- `Evidence`: links to changed files/PR/tests/checks
- `Notes`: short implementation notes and follow-ups

### Completion Rules

1. Mark the step `DONE` only when all acceptance criteria pass.
2. Update `Next Active Step` to the next `TODO` card.
3. Add one line to `Execution Changelog` describing what finished.
4. If blocked, set `Status: BLOCKED` and document blocker + decision needed.

## Next Active Step

- `Step 5 — Products CRUD (Admin)`

---

## Kanban (Approved MVP Scope)

### Backlog

#### Step 1 — RBAC Contract + User Flows

- **Status**: DONE
- **Owner**: Codex + Emanuele
- **Started on**: 2026-03-02
- **Completed on**: 2026-03-02
- **Acceptance Criteria**:
  - ADMIN and USER permissions are explicitly documented.
  - Checkout/return flow is documented with expected outcomes.
  - Forbidden actions and error behavior are listed.
- **Evidence**:
  - `docs/RBAC_CONTRACT.md`
  - `docs/MVP_DASHBOARD_EXECUTION_PLAN.md`
- **Notes**:
  - Added a documentation-only RBAC contract aligned with current Prisma roles (`ADMIN`, `USER`) and auth helper baseline (`requireAuth`, `requireAdmin`).
  - Locked checkout (`OUT`) and return (`IN`) flow expectations, forbidden actions, and status + app-code error behavior for Step 2 endpoint design.

#### Step 2 — API Design (Route Handlers)

- **Status**: DONE
- **Owner**: Codex + Emanuele
- **Started on**: 2026-03-02
- **Completed on**: 2026-03-02
- **Acceptance Criteria**:
  - Endpoint matrix finalized for products, movements, and role updates.
  - Auth/role requirement defined per endpoint.
  - Standard error response shape documented.
- **Evidence**:
  - `docs/API_ROUTE_HANDLERS_CONTRACT.md`
  - `docs/MVP_DASHBOARD_EXECUTION_PLAN.md`
- **Notes**:
  - Finalized endpoint matrix for products, movements, users, and role updates using Next.js Route Handlers scope.
  - Defined per-endpoint auth and RBAC requirements aligned with `requireAuth`/`requireAdmin`.
  - Standardized API response contract around a TypeScript discriminated union (`ApiResult<T>`) with app-level error codes.
  - Normalized Markdown table rendering for the endpoint matrix to ensure correct row/column parsing in docs.

#### Step 3 — Validation Layer (`zod`)

- **Status**: DONE
- **Owner**: Codex + Emanuele
- **Started on**: 2026-03-03
- **Completed on**: 2026-03-03
- **Acceptance Criteria**:
  - Mutating endpoints validate payloads with `zod`.
  - Validation errors are user-friendly and consistent.
- **Evidence**:
  - `src/lib/api/schemas.ts`
  - `src/lib/api/validation.ts`
  - `src/lib/api/errors.ts`
  - `src/lib/api/response.ts`
  - `src/lib/api/types.ts`
  - `src/app/api/products/route.ts`
  - `src/app/api/products/[id]/route.ts`
  - `src/app/api/movements/checkout/route.ts`
  - `src/app/api/movements/return/route.ts`
  - `src/app/api/users/[id]/role/route.ts`
  - `docs/API_ROUTE_HANDLERS_CONTRACT.md`
- **Notes**:
  - Added shared `zod` schemas and parser helpers for all mutating endpoint payloads.
  - Standardized validation/error envelopes using discriminated union `ApiResult<T>` and app error codes.
  - Implemented Route Handlers with validation already applied, including atomic checkout/return DB transactions.

### Sprint 1

#### Step 4 — API Route Handler Critical Tests (Vitest + Playwright Smoke)

- **Status**: DONE
- **Owner**: Codex + Emanuele
- **Started on**: 2026-03-03
- **Completed on**: 2026-03-03
- **Acceptance Criteria**:
  - Critical API route handlers have co-located unit tests (`*.test.ts`) beside source files.
  - E2E smoke tests for API routes exist under `tests/api/` (or `tests/<feature>/`) with `*.spec.ts`.
  - Unit tests cover critical success/error contracts for:
    - `products` handlers
    - `movements` handlers (`checkout`, `return`)
    - `users role` handler
  - Minimum critical error coverage enforced:
    - `401 AUTH_UNAUTHENTICATED`
    - `403 AUTH_FORBIDDEN` (where applicable)
    - `422 INVALID_REQUEST_BODY` / `INVALID_MOVEMENT_QUANTITY`
    - `404 PRODUCT_NOT_FOUND` / `USER_NOT_FOUND`
    - `409 INSUFFICIENT_STOCK`
  - `npm run test` passes.
  - `npm run test:e2e` smoke suite passes.
- **Evidence**:
  - `src/app/api/products/route.test.ts`
  - `src/app/api/products/[id]/route.test.ts`
  - `src/app/api/movements/route.test.ts`
  - `src/app/api/movements/checkout/route.test.ts`
  - `src/app/api/movements/return/route.test.ts`
  - `src/app/api/users/route.test.ts`
  - `src/app/api/users/[id]/role/route.test.ts`
  - `tests/api/routes.smoke.spec.ts`
  - `playwright.config.ts`
  - `npm run test`
  - `npm run test:e2e`
- **Notes**:
  - Added co-located Vitest suites for all API route handlers with focused critical success/error contract assertions.
  - Added Playwright API smoke tests under `tests/api` that validate unauthenticated access returns `401 AUTH_UNAUTHENTICATED` consistently across all protected endpoints.
  - Updated Playwright config with local `baseURL` and `webServer` startup to support API smoke execution against the app.

#### Step 5 — Products CRUD (Admin)

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Admin can create, edit, delete, and list products.
  - Product table supports search/sort.
- **Evidence**:
- **Notes**:

#### Step 6 — Checkout/Return Movements (User + Admin)

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - OUT movement decreases quantity.
  - Return uses opposite IN movement and restores quantity.
  - Quantity update + movement write are atomic.
- **Evidence**:
- **Notes**:

#### Step 7 — Movement History Feed

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Feed shows who moved what and when.
  - Filtering by type/date/user/product works.
- **Evidence**:
- **Notes**:

### Sprint 2

#### Step 8 — Analytics Summary Widgets

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Dashboard cards show totals, low-stock count, recent movement KPIs.
  - Data is accurate against current DB state.
- **Evidence**:
- **Notes**:

#### Step 9 — Role Management (Admin)

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Admin can promote/demote users.
  - Role updates stay synced with Clerk metadata.
- **Evidence**:
- **Notes**:

### Done Gate

#### Step 10 — UX + Reliability Hardening

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Empty/loading/error states implemented across MVP screens.
  - RBAC checks verified manually (unauthenticated, USER, ADMIN).
  - `npm run lint` and `npm run build` pass.
- **Evidence**:
- **Notes**:

---

## Architecture Decisions (Locked for MVP)

- Private dashboard: authenticated users only.
- RBAC: ADMIN full CRUD + role management; USER read products + checkout/return flows.
- Return model: opposite movement (`OUT` for checkout, `IN` for return).
- Data layer: Route Handlers + `fetch`.
- Libraries now: adopt `zod`; defer GraphQL and heavy global state libs unless needed.
- Optional later: TanStack Query for interactive/cached client-heavy views.

## Suggested Endpoint Surface (Planning Reference)

- `GET /api/products`
- `POST /api/products` (ADMIN)
- `PATCH /api/products/:id` (ADMIN)
- `DELETE /api/products/:id` (ADMIN)
- `GET /api/movements`
- `POST /api/movements/checkout` (USER/ADMIN)
- `POST /api/movements/return` (USER/ADMIN)
- `GET /api/users`
- `PATCH /api/users/:id/role` (ADMIN)

---

## Execution Changelog

- 2026-02-27: Initial execution plan created and approved scope captured.
- 2026-03-02: Completed Step 1 (RBAC Contract + User Flows) and advanced Next Active Step to Step 2 (API Design).
- 2026-03-02: Completed Step 2 (API Design for Route Handlers) and advanced Next Active Step to Step 3 (Validation Layer with zod).
- 2026-03-03: Completed Step 3 (Validation Layer with zod) and implemented API Route Handlers with standardized Result/error responses.
- 2026-03-03: Corrected malformed endpoint matrix Markdown table in API contract doc while preserving endpoint contracts.
- 2026-03-03: Inserted a new Step 4 testing gate for critical API Route Handler coverage (Vitest + Playwright smoke) and renumbered downstream MVP steps.
- 2026-03-03: Resolved npm peer dependency conflict by aligning React/React DOM patch versions with Clerk peer requirements, and made `postinstall` resilient when `DATABASE_URL` is not set; verified installs without force/legacy-peer-deps.
- 2026-03-03: Aligned Prisma CLI to Prisma 7 to match runtime packages and validated clean install with consistent Prisma majors.
- 2026-03-03: Configured Playwright for Chromium-only E2E on macOS ARM by removing Firefox/WebKit projects and adding Chromium-specific install/run npm scripts.
- 2026-03-03: Isolated test runners by scoping Vitest to unit tests and excluding Playwright E2E folders/config so `npm run test` runs unit tests only while `npm run test:e2e` remains Playwright-only.
- 2026-03-03: Updated AGENTS guidance with explicit testing conventions: co-located Vitest unit tests beside source files and feature-grouped Playwright E2E tests under `tests/<feature>/`.
- 2026-03-03: Added a Testing Quick Start section and a Project Scripts table to README documenting Vitest unit-test co-location and Playwright E2E placement/commands.
- 2026-03-03: Completed Step 4 by adding critical Vitest coverage for all API handlers, adding unauthenticated Playwright API smoke tests, and wiring Playwright local baseURL/webServer config.
- 2026-03-03: Added TSDoc documentation with `@example` usage snippets to all API route handlers to improve maintainability and onboarding.
- 2026-03-04: Hardened checkout route concurrency by switching to an atomic conditional stock decrement to prevent oversell under parallel requests; updated checkout unit tests for guarded update flow.
