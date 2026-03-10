import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function ProductsEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>No products yet</CardTitle>
        <CardDescription>
          Your catalog is empty. Products will appear here once inventory is
          added.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>
          Search, sorting, and pagination are ready for the first batch of
          products.
        </p>
      </CardContent>
    </Card>
  )
}
