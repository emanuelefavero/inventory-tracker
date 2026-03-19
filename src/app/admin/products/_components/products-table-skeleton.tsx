import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const SKELETON_ROWS = 5

export function ProductsTableSkeleton() {
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
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className='h-4 w-20' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-32' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-5 w-20 rounded-full' />
                </TableCell>
                <TableCell className='text-right'>
                  <Skeleton className='ml-auto h-4 w-8' />
                </TableCell>
                <TableCell>
                  <Skeleton className='h-4 w-28' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <Skeleton className='h-4 w-48' />
        <div className='flex items-center gap-2'>
          <Skeleton className='h-8 w-20' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-8 w-16' />
        </div>
      </div>
    </div>
  )
}
