export type MovementItem = {
  id: string
  type: 'OUT' | 'IN'
  quantity: number
  createdAt: string
  userId: string
  productId: string
}
