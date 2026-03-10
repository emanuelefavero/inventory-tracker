import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth-helpers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ProductsAdminContent } from './_components/products-admin-content'

type ProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export function normalizeProductsSearchParams(
  value: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      Array.isArray(entry) ? entry[0] : entry,
    ]),
  )
}

function ProductsAdminLoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading products</CardTitle>
        <CardDescription>
          Pulling the latest inventory records for the admin dashboard.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function ProductsAdminForbiddenState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin access required</CardTitle>
        <CardDescription>
          This page is reserved for inventory administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>
          You are signed in, but your account does not have permission to manage
          products.
        </p>
      </CardContent>
    </Card>
  )
}

export default async function ProductsAdminPage({
  searchParams,
}: ProductsPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/')
  }

  if (user.role !== 'ADMIN') {
    return <ProductsAdminForbiddenState />
  }

  const normalizedQuery = normalizeProductsSearchParams(await searchParams)

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>
          Product catalog
        </h1>
        <p className='max-w-2xl text-sm text-muted-foreground'>
          Browse the current inventory, refine by search, and review stock
          updates page by page.
        </p>
      </div>

      <Suspense fallback={<ProductsAdminLoadingState />}>
        <ProductsAdminContent query={normalizedQuery} />
      </Suspense>
    </div>
  )
}
