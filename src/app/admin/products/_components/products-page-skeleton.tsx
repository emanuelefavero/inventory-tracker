import { ProductsTableSkeleton } from './products-table-skeleton'
import { ProductsToolbarSkeleton } from './products-toolbar-skeleton'

export function ProductsPageSkeleton() {
  return (
    <div className='space-y-6'>
      <ProductsToolbarSkeleton />
      <ProductsTableSkeleton />
    </div>
  )
}
