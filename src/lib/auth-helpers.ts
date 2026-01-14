import { Role } from '@/generated/prisma/client'
import prisma from '@/lib/prisma'
import { auth, clerkClient } from '@clerk/nextjs/server'

/**
 * Get the current authenticated user from the database
 * Automatically creates user in database on first sign-in
 */
export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  // If user doesn't exist, create them (first sign-in)
  if (!user) {
    user = await getOrCreateUser(userId)
  }

  return user
}

/**
 * Get or create user in database from Clerk authentication
 * This is called when a user signs in for the first time
 */
export async function getOrCreateUser(clerkUserId: string) {
  // Check if user already exists
  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
  })

  if (user) return user

  // User doesn't exist, fetch from Clerk and create
  const clerkUser = await (await clerkClient()).users.getUser(clerkUserId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  if (!email) {
    throw new Error('User email not found in Clerk')
  }

  // Check if this email should be an admin (from env variable)
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim()) || []
  const isAdmin = adminEmails.includes(email)

  // Create new user in database
  user = await prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email,
      name: clerkUser.fullName || clerkUser.firstName || null,
      role: isAdmin ? Role.ADMIN : Role.USER,
    },
  })

  // Optional: Sync role to Clerk metadata for faster reads
  await (
    await clerkClient()
  ).users.updateUserMetadata(clerkUserId, {
    publicMetadata: { role: user.role },
  })

  return user
}

/**
 * Require authentication - throws error if not authenticated
 * Use in server actions and API routes
 */
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized: Authentication required')
  }

  // Get or create user in database
  const user = await getOrCreateUser(userId)

  if (!user) {
    throw new Error('User not found in database')
  }

  return user
}

/**
 * Require admin role - throws error if not authenticated or not admin
 * Use in server actions and API routes that require admin access
 */
export async function requireAdmin() {
  const user = await requireAuth()

  if (user.role !== Role.ADMIN) {
    throw new Error('Forbidden: Admin access required')
  }

  return user
}

/**
 * Check if current user is admin
 * Returns false if not authenticated or not admin
 */
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === Role.ADMIN
}

/**
 * Update user role (admin only)
 * Syncs role to Clerk metadata
 */
export async function updateUserRole(
  targetUserId: string,
  newRole: Role,
): Promise<void> {
  // Ensure requester is admin
  await requireAdmin()

  // Update role in database
  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  })

  // Sync to Clerk metadata
  await (
    await clerkClient()
  ).users.updateUserMetadata(user.clerkId, {
    publicMetadata: { role: newRole },
  })
}
