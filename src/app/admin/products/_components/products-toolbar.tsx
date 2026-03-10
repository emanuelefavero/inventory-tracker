'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowDownAZIcon, ArrowUpAZIcon, SearchIcon } from 'lucide-react'

export type ProductsSortBy =
  | 'createdAt'
  | 'category'
  | 'name'
  | 'quantity'
  | 'sku'
  | 'updatedAt'

type ProductsToolbarProps = {
  isPending: boolean
  onSearchChange: (value: string) => void
  onSortByChange: (value: ProductsSortBy) => void
  onSortOrderToggle: () => void
  searchValue: string
  sortBy: ProductsSortBy
  sortOrder: 'asc' | 'desc'
}

const SORT_OPTIONS: Array<{ label: string; value: ProductsSortBy }> = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created' },
  { value: 'sku', label: 'SKU' },
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'quantity', label: 'Quantity' },
]

export function ProductsToolbar({
  isPending,
  onSearchChange,
  onSortByChange,
  onSortOrderToggle,
  searchValue,
  sortBy,
  sortOrder,
}: ProductsToolbarProps) {
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='relative w-full sm:max-w-sm'>
        <SearchIcon
          aria-hidden='true'
          className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'
        />
        <Input
          aria-label='Search products'
          className='pl-9'
          disabled={isPending}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder='Search by SKU or name'
          value={searchValue}
        />
      </div>

      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <Select
          onValueChange={(value) => onSortByChange(value as ProductsSortBy)}
          value={sortBy}
        >
          <SelectTrigger
            aria-label='Sort products by field'
            className='w-full sm:w-44'
          >
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          aria-label={`Sort order ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          disabled={isPending}
          onClick={onSortOrderToggle}
          size='icon'
          type='button'
          variant='outline'
        >
          {sortOrder === 'asc' ? <ArrowUpAZIcon /> : <ArrowDownAZIcon />}
        </Button>
      </div>
    </div>
  )
}
