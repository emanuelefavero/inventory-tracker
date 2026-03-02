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

- `Step 2 — API Design (Route Handlers)`

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

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Endpoint matrix finalized for products, movements, and role updates.
  - Auth/role requirement defined per endpoint.
  - Standard error response shape documented.
- **Evidence**:
- **Notes**:

#### Step 3 — Validation Layer (`zod`)

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Mutating endpoints validate payloads with `zod`.
  - Validation errors are user-friendly and consistent.
- **Evidence**:
- **Notes**:

### Sprint 1

#### Step 4 — Products CRUD (Admin)

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Admin can create, edit, delete, and list products.
  - Product table supports search/sort.
- **Evidence**:
- **Notes**:

#### Step 5 — Checkout/Return Movements (User + Admin)

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

#### Step 6 — Movement History Feed

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

#### Step 7 — Analytics Summary Widgets

- **Status**: TODO
- **Owner**:
- **Started on**:
- **Completed on**:
- **Acceptance Criteria**:
  - Dashboard cards show totals, low-stock count, recent movement KPIs.
  - Data is accurate against current DB state.
- **Evidence**:
- **Notes**:

#### Step 8 — Role Management (Admin)

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

#### Step 9 — UX + Reliability Hardening

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
