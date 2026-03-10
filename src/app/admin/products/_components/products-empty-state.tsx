'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PlusIcon, SearchXIcon } from 'lucide-react'
import { useProductsAdminUIStore } from '../_store/use-products-admin-ui-store'

type ProductsEmptyStateProps = {
  hasActiveSearch: boolean
}

export function ProductsEmptyState({
  hasActiveSearch,
}: ProductsEmptyStateProps) {
  const openCreate = useProductsAdminUIStore((s) => s.openCreate)

  if (hasActiveSearch) {
    return (
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <SearchXIcon className='size-5 text-muted-foreground' />
            <CardTitle>No matching products</CardTitle>
          </div>
          <CardDescription>
            No products matched your search. Try a different keyword or clear
            the search filter.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>No products yet</CardTitle>
        <CardDescription>
          Your catalog is empty. Create your first product to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={openCreate} type='button'>
          <PlusIcon />
          Create your first product
        </Button>
      </CardContent>
    </Card>
  )
}
