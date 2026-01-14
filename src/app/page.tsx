import { Test } from '@/__dev__/test'
import { getCurrentUser } from '@/lib/auth-helpers'
import { Suspense } from 'react'

async function UserInfo() {
  // This will trigger Clerk-Prisma sync if user doesn't exist yet
  const user = await getCurrentUser()

  return user ? (
    <div className='mt-4 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950'>
      <h2 className='text-lg font-semibold text-green-700 dark:text-green-300'>
        ✅ Clerk + Prisma Sync Working!
      </h2>
      <div className='mt-2 space-y-1 text-sm'>
        <p>
          <strong>Name:</strong> {user.name || 'Not provided'}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong>{' '}
          <span
            className={
              user.role === 'ADMIN'
                ? 'font-bold text-purple-600 dark:text-purple-400'
                : 'text-blue-600 dark:text-blue-400'
            }
          >
            {user.role}
          </span>
        </p>
        <p className='text-xs text-gray-500'>
          Clerk ID: {user.clerkId.slice(0, 20)}...
        </p>
        <p className='text-xs text-gray-500'>
          Created: {new Date(user.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  ) : (
    <div className='mt-4 rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950'>
      <p className='text-yellow-700 dark:text-yellow-300'>
        👤 Not signed in. Click Sign In in the header to test authentication.
      </p>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <h1 className='text-4xl font-bold'>Hello</h1>

      {/* Wrap async data fetching in Suspense for Next.js 16 */}
      <Suspense
        fallback={
          <div className='mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:bg-gray-900'>
            <p className='text-gray-500'>Loading user info...</p>
          </div>
        }
      >
        <UserInfo />
      </Suspense>

      {process.env.NODE_ENV === 'development' && <Test />}
    </>
  )
}
