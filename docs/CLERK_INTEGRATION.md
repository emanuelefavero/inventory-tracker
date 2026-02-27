# Clerk + Prisma Integration Guide

## 🎉 Setup Complete

Your inventory tracker now uses **Clerk for authentication** and **Prisma for user data management**. Users are automatically created in your database when they sign in via Clerk.

---

## 🔑 How Authentication Works

1. **User signs up/in via Clerk** (email or Google)
2. **First time sign-in**: User is automatically created in Prisma database with `clerkId`
3. **Role assignment**:
   - Default role: `USER`
   - Auto-admin: If email matches `ADMIN_EMAILS` in `.env`
4. **Subsequent sign-ins**: User data fetched from Prisma using `clerkId`

---

## 👤 Making Yourself an Admin

### Method 1: Environment Variable (Recommended)

Add your email to `.env`:

```env
ADMIN_EMAILS=your-email@example.com
```

Then sign in via Clerk. You'll automatically be assigned the `ADMIN` role!

**For multiple admins:**

```env
ADMIN_EMAILS=admin@company.com,boss@company.com,manager@company.com
```

### Method 2: Database Direct Update

If you've already signed in as a regular user:

1. Open Prisma Studio:

   ```bash
   npx prisma studio
   ```

2. Navigate to the `User` table
3. Find your user record
4. Change `role` from `USER` to `ADMIN`
5. Save

### Method 3: Database Script

Create a script to promote yourself:

```typescript
// scripts/make-admin.ts
import prisma from '@/lib/prisma'

async function makeAdmin(email: string) {
  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })
  console.log(`✅ ${user.email} is now an admin!`)
}

makeAdmin('your-email@example.com')
```

Run it:

```bash
npx tsx scripts/make-admin.ts
```

---

## 🛠️ Using Auth in Your App

### In Server Components

```typescript
import { getCurrentUser, isAdmin } from '@/lib/auth-helpers'

export default async function MyPage() {
  const user = await getCurrentUser()
  const adminAccess = await isAdmin()

  return (
    <div>
      {user && <p>Welcome, {user.name}</p>}
      {adminAccess && <AdminPanel />}
    </div>
  )
}
```

### In Server Actions

```typescript
'use server'

import { requireAuth, requireAdmin } from '@/lib/auth-helpers'

export async function createProduct(data: ProductInput) {
  // Only admins can create products
  await requireAdmin()

  return await prisma.product.create({ data })
}

export async function createMovement(data: MovementInput) {
  // Any authenticated user can create movements
  const user = await requireAuth()

  return await prisma.inventoryMovement.create({
    data: {
      ...data,
      userId: user.id
    }
  })
}
```

### In API Routes

```typescript
import { requireAuth, requireAdmin } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  const user = await requireAuth()
  // ... your logic
}

export async function DELETE(request: Request) {
  await requireAdmin() // Admin only
  // ... deletion logic
}
```

---

## 📊 Available Auth Helper Functions

### `getCurrentUser()`

- Returns: User object or `null`
- Use: When auth is optional
- Example: Showing different UI for logged-in users

### `requireAuth()`

- Returns: User object
- Throws: Error if not authenticated
- Use: Server actions/API routes requiring authentication
- Auto-creates user in DB on first sign-in

### `requireAdmin()`

- Returns: Admin user object
- Throws: Error if not authenticated or not admin
- Use: Admin-only operations

### `isAdmin()`

- Returns: `boolean`
- Use: Quick admin checks without throwing errors

### `getOrCreateUser(clerkUserId)`

- Returns: User object
- Use: Internal function (auto-called by `requireAuth`)
- Creates user in Prisma if doesn't exist

### `updateUserRole(userId, newRole)`

- Updates user role in both Prisma and Clerk metadata
- Requires: Current user must be admin
- Use: Admin UI for managing roles

---

## 🔐 Role-Based Access Example

```typescript
// app/products/actions.ts
'use server'

import { requireAuth, requireAdmin } from '@/lib/auth-helpers'

// USER or ADMIN can view products
export async function getProducts() {
  await requireAuth()
  return await prisma.product.findMany()
}

// USER or ADMIN can create OUT movements
export async function removeInventory(productId: string, quantity: number) {
  const user = await requireAuth()

  return await prisma.inventoryMovement.create({
    data: {
      userId: user.id,
      productId,
      type: 'OUT',
      quantity
    }
  })
}

// Only ADMIN can add inventory (IN movements)
export async function addInventory(productId: string, quantity: number) {
  const user = await requireAdmin()

  return await prisma.inventoryMovement.create({
    data: {
      userId: user.id,
      productId,
      type: 'IN',
      quantity
    }
  })
}

// Only ADMIN can delete products
export async function deleteProduct(productId: string) {
  await requireAdmin()
  return await prisma.product.delete({ where: { id: productId } })
}
```

---

## 🚀 Next Steps

1. **Add your email to `.env`** under `ADMIN_EMAILS`
2. **Start the dev server**: `npm run dev`
3. **Sign in via Clerk** - you'll be auto-created as admin
4. **Build your inventory features** using the auth helpers
5. **Create admin UI** for managing user roles

---

## 📝 Database Schema

Your updated User model:

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique    // ← Clerk user ID
  email     String   @unique
  name      String?
  role      Role     @default(USER)  // USER or ADMIN

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  movements InventoryMovement[]
}
```

---

## 🔍 Troubleshooting

### "User not found in database" error

- User needs to sign in at least once via Clerk
- `getOrCreateUser()` runs automatically on first sign-in

### Role not updating

- Clear browser cache
- Check `.env` has correct `ADMIN_EMAILS`
- Verify user signed in AFTER adding email to `.env`

### Can't access admin features

- Verify your role in Prisma Studio: `npx prisma studio`
- Check if email matches exactly (including case)
- Try signing out and back in

---

## 📚 Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
