# Prisma ORM Setup Guide - Inventory Tracker

## Overview

Prisma ORM has been set up for your inventory tracking application with PostgreSQL (NeonDB). The schema includes models for Users, Products, and Inventory Movements with support for two roles: **USER** and **ADMIN**.

## What Was Configured

### 1. Dependencies Installed

```bash
# Dev dependencies
- prisma
- tsx
- @types/pg

# Runtime dependencies
- @prisma/client
- @prisma/adapter-pg
- dotenv
- pg
```

### 2. Project Structure

```txt
/prisma
  ├── schema.prisma      # Database schema definition
  └── seed.ts            # Seed data script
/src
  ├── lib
  │   └── prisma.ts      # Prisma client singleton
  └── generated/         # Auto-generated Prisma client (gitignored)
prisma.config.ts         # Prisma configuration
.env                     # Environment variables (gitignored)
```

### 3. Database Schema

The schema includes:

- **User**: Admin and regular users with authentication support (roles: USER, ADMIN)
- **Product**: Inventory products with SKU, name, category, and quantity tracking
- **InventoryMovement**: Track inventory changes (IN/OUT movements)

**Key Features:**

- Simple role-based access control (USER/ADMIN)
- Product categorization using strings
- Movement tracking with type (IN/OUT) and quantity
- All models use `cuid()` for IDs and include timestamps

**Schema Details:**

```prisma
enum Role {
  USER
  ADMIN
}

enum MovementType {
  OUT
  IN
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  movements InventoryMovement[]
}

model Product {
  id        String   @id @default(cuid())
  sku       String   @unique
  name      String

  category  String

  quantity  Int      @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  movements InventoryMovement[]
}

model InventoryMovement {
  id        String       @id @default(cuid())

  userId    String
  user      User         @relation(fields: [userId], references: [id])

  productId String
  product   Product      @relation(fields: [productId], references: [id])

  type      MovementType
  quantity  Int

  createdAt DateTime     @default(now())
}
```

## Setup Steps

### Step 1: Configure NeonDB Connection

1. Go to [NeonDB](https://neon.tech/) and create a new PostgreSQL database
2. Copy your connection string
3. Open `.env` and replace the placeholder:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=verify-full"
```

Replace with your actual NeonDB connection string (it will look like):

```env
DATABASE_URL="postgresql://username:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=verify-full"
```

Use `sslmode=verify-full` instead of `sslmode=require` to avoid the `pg-connection-string` warning and keep full TLS hostname verification enabled. If your connection string already includes other query params such as `channel_binding=require`, keep them unchanged.

### Step 2: Generate Prisma Client and Run Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create and apply initial migration
npx prisma migrate dev --name init
```

This will:

- Create the database tables
- Generate the Prisma client in `src/generated/prisma`

### Step 3: Seed the Database (Optional)

Populate the database with sample data:

```bash
npx prisma db seed
```

This creates:

- 2 users (admin and regular user)
- 4 products (laptop, mouse, chair, pens)
- 3 sample inventory movements

### Step 4: View Your Data

Open Prisma Studio to visually inspect your database:

```bash
npx prisma studio
```

## Using Prisma in Your App

### Import the Prisma Client

```typescript
import prisma from '@/lib/prisma'
```

### Example Queries

**Get all products:**

```typescript
const products = await prisma.product.findMany({
  include: {
    movements: true,
  },
})
```

**Create a new product:**

```typescript
const product = await prisma.product.create({
  data: {
    sku: 'PROD-001',
    name: 'New Product',
    category: 'Electronics',
    quantity: 50,
  },
})
```

**Record inventory movement (IN):**

```typescript
const movement = await prisma.inventoryMovement.create({
  data: {
    userId: 'user-id',
    productId: 'product-id',
    type: 'IN',
    quantity: 20,
  },
})
```

**Record inventory movement (OUT):**

```typescript
const movement = await prisma.inventoryMovement.create({
  data: {
    userId: 'user-id',
    productId: 'product-id',
    type: 'OUT',
    quantity: 5,
  },
})
```

**Get product with movement history:**

```typescript
const product = await prisma.product.findUnique({
  where: { id: 'product-id' },
  include: {
    movements: {
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    },
  },
})
```

**Get all movements by user:**

```typescript
const movements = await prisma.inventoryMovement.findMany({
  where: {
    userId: 'user-id',
  },
  include: {
    product: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
})
```

**Get products by category:**

```typescript
const products = await prisma.product.findMany({
  where: {
    category: 'Electronics',
  },
})
```

**Search products by name:**

```typescript
const products = await prisma.product.findMany({
  where: {
    name: {
      contains: 'laptop',
      mode: 'insensitive',
    },
  },
})
```

## Important Notes

### Production Deployment

1. The `postinstall` script in `package.json` ensures Prisma Client is generated during deployment
2. Make sure to set `DATABASE_URL` in your production environment variables
3. Run migrations in production: `npx prisma migrate deploy`

### Development Tips

- The Prisma client is attached to the global object in development to prevent hot-reload issues
- Always use `prisma.` prefix to access models
- Use `npx prisma studio` to visually manage data
- Use `npx prisma format` to format your schema file

### Next Steps

1. **Configure NeonDB connection** in `.env`
2. **Run migrations**: `npx prisma migrate dev --name init`
3. **Seed database**: `npx prisma db seed`
4. **Start building** your inventory tracking features!

## Useful Commands

```bash
# Generate Prisma client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## Schema Modifications

To modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Update your seed file if needed
4. The Prisma client will be automatically regenerated

## Troubleshooting

### **Error: Environment variable not found: DATABASE_URL**

- Make sure `.env` file exists in the project root
- Check that `DATABASE_URL` is properly set

### **Error: Can't reach database server**

- Verify your NeonDB connection string is correct
- Check if your IP is whitelisted in NeonDB (if applicable)
- Ensure your internet connection is stable

### **Type errors after schema changes**

- Run `npx prisma generate` to regenerate the client
- Restart your TypeScript server in VS Code

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client)
- [NeonDB Documentation](https://neon.tech/docs)
