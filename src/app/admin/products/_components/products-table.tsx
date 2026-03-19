'use client'

import { Badge } from '@/components/ui/badge'
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
import { cn } from '@/lib/utils'

const LOW_STOCK_THRESHOLD = 5

type ProductsTableProps = {
  items: ProductDetail[]
  onNextPage: () => void
  onPreviousPage: () => void
  pageInfo: PageInfo
  disabled?: boolean
}

const updatedAtFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ProductsTable({
  items,
  onNextPage,
  onPreviousPage,
  pageInfo,
  disabled,
}: ProductsTableProps) {
  const startItem =
    pageInfo.totalItems === 0 ? 0 : (pageInfo.page - 1) * pageInfo.limit + 1
  const endItem = Math.min(pageInfo.page * pageInfo.limit, pageInfo.totalItems)

  return (
    <div className='space-y-4'>
      <div className='overflow-x-auto'>
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
              <TableRow key={product.id} className='hover:bg-muted/50'>
                <TableCell className='font-medium'>{product.sku}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>
                  <Badge variant='secondary'>{product.category}</Badge>
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right',
                    product.quantity <= LOW_STOCK_THRESHOLD &&
                      'font-medium text-destructive',
                  )}
                >
                  {product.quantity}
                </TableCell>
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
            disabled={disabled || pageInfo.page <= 1}
            onClick={onPreviousPage}
            size='sm'
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
            disabled={disabled || pageInfo.page >= pageInfo.totalPages}
            onClick={onNextPage}
            size='sm'
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
