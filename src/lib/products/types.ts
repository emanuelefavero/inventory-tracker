export type ProductSummary = {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
}

export type ProductDetail = ProductSummary & {
  createdAt: string
  updatedAt: string
}
