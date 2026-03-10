# Architecture

- Purpose: Current-state architecture only.
- Last reviewed against: `Step 5 — Products CRUD (Admin), Phase 2` on March 10, 2026.
- Update rule: Update this file in the same task whenever architecture changes.
- Scope note: This document reflects static code analysis of the current repo state unless stated otherwise.

## 1. System Context

Legend: solid arrows are primary runtime calls; dashed arrows are supporting dependencies or shared infrastructure.

```mermaid
flowchart TB
  subgraph Client
    Browser[Browser]
  end

  subgraph NextApp[Next.js App]
    AppPages[App Router pages]
    ApiRoutes[Route Handlers API]
    SharedUI[Shared layout and UI components]
    AuthHelpers[Auth helpers]
    DomainLibs[Domain libraries]
    ApiInfra[API response, validation, and error infrastructure]
    UIState[Route-local Zustand UI store]
  end

  subgraph External
    Clerk[Clerk]
  end

  subgraph Data
    Prisma[Prisma client with PG adapter]
    Postgres[(PostgreSQL)]
  end

  Browser --> AppPages
  Browser --> ApiRoutes
  AppPages --> SharedUI
  AppPages --> AuthHelpers
  AppPages --> DomainLibs
  AppPages -.-> UIState
  ApiRoutes --> AuthHelpers
  ApiRoutes --> ApiInfra
  ApiRoutes --> DomainLibs
  DomainLibs --> Prisma
  AuthHelpers --> Clerk
  AuthHelpers --> Prisma
  Prisma --> Postgres
```

The current UI surface is intentionally thin. The main implemented product surface is `/admin/products`, while the API surface is already broader and covers products, movements, and users.

## 2. Admin Products Read Path

This is the most important current request flow in the application. Product reads are server-first and do not loop back through the internal `/api/products` route.

```mermaid
sequenceDiagram
  participant B as Browser
  participant P as /admin/products page
  participant A as getCurrentUser()
  participant C as ProductsAdminContent
  participant Q as listProducts()
  participant R as Prisma
  participant D as PostgreSQL
  participant U as ProductsAdminClient

  B->>P: Request /admin/products?search&sort&page
  P->>A: Read current user
  A->>R: Find or create user
  R->>D: Query user table
  D-->>R: User record
  R-->>A: User
  A-->>P: User or null
  P->>P: Redirect unauthenticated users to /
  P->>P: Render forbidden state for non-admin users
  P->>C: Pass normalized query params
  C->>Q: Parse and request product list
  Q->>R: Product findMany + count
  R->>D: Query products
  D-->>R: Rows + total
  R-->>Q: Product data
  Q-->>C: items + pageInfo
  C-->>U: Render client shell
  U->>P: URL updates for search, sort, pagination
```

Current client responsibilities are limited to query-string orchestration, pending-state UX, and view rendering. The create/edit/delete UI orchestration store exists but is not yet fully wired into visible mutation dialogs.

## 3. API and Backend Architecture

```mermaid
flowchart TB
  subgraph Routes[Route Handlers]
    Products[Products routes<br/>GET/POST /api/products<br/>PATCH/DELETE /api/products/:id]
    Movements[Movement routes<br/>GET /api/movements<br/>POST /api/movements/checkout<br/>POST /api/movements/return]
    Users[User routes<br/>GET /api/users<br/>PATCH /api/users/:id/role]
  end

  subgraph Shared[Shared backend modules]
    Auth[auth-helpers.ts]
    Validation[src/lib/api validation and schemas]
    Responses[src/lib/api errors and ApiResult]
    ProductDomain[src/lib/products]
    MovementDomain[src/lib/movements]
    UserDomain[src/lib/users]
  end

  subgraph Persistence[Persistence]
    PrismaClient[Prisma singleton]
    DB[(PostgreSQL)]
    ClerkSvc[Clerk]
  end

  Products --> Auth
  Products --> Validation
  Products --> Responses
  Products --> ProductDomain

  Movements --> Auth
  Movements --> Validation
  Movements --> Responses
  Movements --> MovementDomain

  Users --> Auth
  Users --> Validation
  Users --> Responses
  Users --> UserDomain

  ProductDomain --> PrismaClient
  MovementDomain --> PrismaClient
  UserDomain --> PrismaClient
  Auth --> PrismaClient
  Auth --> ClerkSvc
  PrismaClient --> DB
```

The backend surface is ahead of the UI surface. Products, movements, and role-management APIs exist now, but the admin UI currently exposes only the products read path.

## 4. Data Model

```mermaid
erDiagram
  USER ||--o{ INVENTORY_MOVEMENT : creates
  PRODUCT ||--o{ INVENTORY_MOVEMENT : records

  USER {
    string id
    string clerkId
    string email
    string name
    enum role
    datetime createdAt
    datetime updatedAt
  }

  PRODUCT {
    string id
    string sku
    string name
    string category
    int quantity
    datetime createdAt
    datetime updatedAt
  }

  INVENTORY_MOVEMENT {
    string id
    string userId
    string productId
    enum type
    int quantity
    datetime createdAt
  }
```

Current enum usage:

- `Role`: `USER`, `ADMIN`
- `MovementType`: `OUT` for checkout, `IN` for return

## 5. Step 5 Status

```mermaid
flowchart TB
  Step5[Step 5 Products CRUD]

  subgraph Implemented[Implemented now]
    ReadPath[Server-first admin products read path]
    QueryState[Search sort pagination via URL]
    Store[Zustand dialog orchestration store]
    MutApis[Create update delete product APIs]
  end

  subgraph Pending[Still pending in Step 5]
    FormDialog[Create and edit dialog UI]
    DeleteDialog[Delete confirmation dialog]
    Toasts[Toast feedback and refresh wiring]
    AdminNav[Admin navigation link in header]
  end

  Step5 --> Implemented
  Step5 --> Pending
  Store -.-> FormDialog
  Store -.-> DeleteDialog
  MutApis -.-> FormDialog
  MutApis -.-> DeleteDialog
```

Known current-state notes:

- `/admin/products` reads directly from `src/lib/products/queries.ts` instead of loopback-fetching `/api/products`.
- The home page remains a development-oriented auth-sync smoke page rather than a finished product dashboard.
- The architecture document should be updated when future steps add new pages, visible movement flows, analytics surfaces, role-management UI, or new service boundaries.
