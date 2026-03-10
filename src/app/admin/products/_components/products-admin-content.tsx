import { listProducts } from '@/lib/products/queries'
import { listProductsQuerySchema } from '@/lib/products/schemas'
import { ProductsAdminClient } from './products-admin-client'

type ProductsAdminContentProps = {
  query: Record<string, string | undefined>
}

export async function ProductsAdminContent({
  query,
}: ProductsAdminContentProps) {
  const parsedQuery = listProductsQuerySchema.parse(query)
  const data = await listProducts(parsedQuery)

  return (
    <ProductsAdminClient
      initialQuery={{
        limit: parsedQuery.limit,
        page: parsedQuery.page,
        search: parsedQuery.search,
        sortBy: parsedQuery.sortBy,
        sortOrder: parsedQuery.sortOrder,
      }}
      key={[
        parsedQuery.search ?? '',
        parsedQuery.sortBy ?? '',
        parsedQuery.sortOrder ?? '',
        parsedQuery.page,
        parsedQuery.limit,
      ].join(':')}
      items={data.items}
      pageInfo={data.pageInfo}
    />
  )
}
