import { Skeleton } from '@/components/ui/skeleton'

export function ProductsToolbarSkeleton() {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <Skeleton className='h-9 w-full sm:max-w-sm' />

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Skeleton className='h-9 w-full sm:w-44' />
        <Skeleton className='size-9' />
      </div>
    </div>
  )
}
