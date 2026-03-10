'use client'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageInfo } from '@/lib/api/types'
import { ProductDetail } from '@/lib/products/types'

type ProductsTableProps = {
  isPending: boolean
  items: ProductDetail[]
  onNextPage: () => void
  onPreviousPage: () => void
  pageInfo: PageInfo
}

const updatedAtFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ProductsTable({
  isPending,
  items,
  onNextPage,
  onPreviousPage,
  pageInfo,
}: ProductsTableProps) {
  const startItem =
    pageInfo.totalItems === 0 ? 0 : (pageInfo.page - 1) * pageInfo.limit + 1
  const endItem = Math.min(pageInfo.page * pageInfo.limit, pageInfo.totalItems)

  return (
    <div className='space-y-4'>
      <div className={isPending ? 'opacity-70 transition-opacity' : undefined}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className='text-right'>Quantity</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell className='font-medium'>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className='text-right'>{product.quantity}</TableCell>
                <TableCell>
                  {updatedAtFormatter.format(new Date(product.updatedAt))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-muted-foreground'>
          Showing {startItem}-{endItem} of {pageInfo.totalItems} products
        </p>

        <div className='flex items-center gap-2'>
          <Button
            aria-label='Go to previous products page'
            disabled={isPending || pageInfo.page <= 1}
            onClick={onPreviousPage}
            type='button'
            variant='outline'
          >
            Previous
          </Button>
          <span className='min-w-24 text-center text-muted-foreground'>
            Page {pageInfo.page} of {pageInfo.totalPages}
          </span>
          <Button
            aria-label='Go to next products page'
            disabled={isPending || pageInfo.page >= pageInfo.totalPages}
            onClick={onNextPage}
            type='button'
            variant='outline'
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
