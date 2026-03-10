'use client'

import { PageInfo } from '@/lib/api/types'
import { ProductDetail } from '@/lib/products/types'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { ProductsEmptyState } from './products-empty-state'
import { ProductsTable } from './products-table'
import { ProductsTableSkeleton } from './products-table-skeleton'
import { ProductsSortBy, ProductsToolbar } from './products-toolbar'

export type ProductsAdminQueryState = {
  limit: number
  page: number
  search?: string
  sortBy?: ProductsSortBy
  sortOrder?: 'asc' | 'desc'
}

type ProductsAdminClientProps = {
  initialQuery: ProductsAdminQueryState
  items: ProductDetail[]
  pageInfo: PageInfo
}

export function ProductsAdminClient({
  initialQuery,
  items,
  pageInfo,
}: ProductsAdminClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState(initialQuery.search ?? '')
  const isFirstSearchEffect = useRef(true)

  // Destructure primitives for stable useCallback deps
  const {
    limit: iqLimit,
    page: iqPage,
    search: iqSearch,
    sortBy: iqSortBy,
    sortOrder: iqSortOrder,
  } = initialQuery

  const hasActiveSearch = Boolean(iqSearch?.trim())

  const updateQuery = useCallback(
    (nextValues: Partial<ProductsAdminQueryState>, resetPage: boolean) => {
      const params = new URLSearchParams()
      const nextQuery: ProductsAdminQueryState = {
        limit: iqLimit,
        page: iqPage,
        search: iqSearch,
        sortBy: iqSortBy,
        sortOrder: iqSortOrder,
        ...nextValues,
        ...(resetPage ? { page: 1 } : {}),
      }

      if (nextQuery.search?.trim()) {
        params.set('search', nextQuery.search.trim())
      }

      if (nextQuery.sortBy) {
        params.set('sortBy', nextQuery.sortBy)
      }

      if (nextQuery.sortOrder) {
        params.set('sortOrder', nextQuery.sortOrder)
      }

      if (nextQuery.page > 1) {
        params.set('page', String(nextQuery.page))
      }

      if (nextQuery.limit !== 20) {
        params.set('limit', String(nextQuery.limit))
      }

      const href =
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname

      startTransition(() => {
        router.replace(href, { scroll: false })
      })
    },
    [iqLimit, iqPage, iqSearch, iqSortBy, iqSortOrder, pathname, router],
  )

  // Stable ref so the debounce effect never restarts due to updateQuery identity
  const updateQueryRef = useRef(updateQuery)
  useEffect(() => {
    updateQueryRef.current = updateQuery
  }, [updateQuery])

  useEffect(() => {
    if (isFirstSearchEffect.current) {
      isFirstSearchEffect.current = false
      return
    }

    const timeoutId = window.setTimeout(() => {
      if (searchValue === (iqSearch ?? '')) {
        return
      }

      updateQueryRef.current({ search: searchValue }, true)
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [iqSearch, searchValue])

  function handleSearchChange(value: string) {
    setSearchValue(value)
  }

  function handleSortByChange(value: ProductsSortBy) {
    updateQuery({ sortBy: value }, true)
  }

  function handleSortOrderToggle() {
    updateQuery(
      {
        sortOrder: iqSortOrder === 'asc' ? 'desc' : 'asc',
      },
      true,
    )
  }

  function handlePreviousPage() {
    if (pageInfo.page <= 1) {
      return
    }

    updateQuery({ page: pageInfo.page - 1 }, false)
  }

  function handleNextPage() {
    if (pageInfo.page >= pageInfo.totalPages) {
      return
    }

    updateQuery({ page: pageInfo.page + 1 }, false)
  }

  function renderContent() {
    if (isPending) {
      return <ProductsTableSkeleton />
    }

    if (items.length === 0) {
      return <ProductsEmptyState hasActiveSearch={hasActiveSearch} />
    }

    return (
      <ProductsTable
        items={items}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        pageInfo={pageInfo}
      />
    )
  }

  return (
    <div className='space-y-6'>
      <ProductsToolbar
        isPending={isPending}
        onSearchChange={handleSearchChange}
        onSortByChange={handleSortByChange}
        onSortOrderToggle={handleSortOrderToggle}
        searchValue={searchValue}
        sortBy={iqSortBy ?? 'updatedAt'}
        sortOrder={iqSortOrder ?? 'desc'}
      />

      {renderContent()}
    </div>
  )
}
