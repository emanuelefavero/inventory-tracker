import { beforeEach, describe, expect, it } from 'vitest'

import { ProductDetail } from '@/lib/products/types'
import { useProductsAdminUIStore } from './use-products-admin-ui-store'

const makeProduct = (): ProductDetail => ({
  id: 'prod-1',
  sku: 'SKU-001',
  name: 'Keyboard',
  category: 'Peripherals',
  quantity: 10,
  createdAt: '2026-03-01T10:00:00.000Z',
  updatedAt: '2026-03-01T10:00:00.000Z',
})

describe('useProductsAdminUIStore', () => {
  beforeEach(() => {
    useProductsAdminUIStore.getState().closeDialogs()
  })

  it('opens create mode without selected products', () => {
    useProductsAdminUIStore.getState().openCreate()

    expect(useProductsAdminUIStore.getState()).toMatchObject({
      formMode: 'create',
      selectedProduct: null,
      productPendingDelete: null,
    })
  })

  it('opens edit mode with the selected product', () => {
    const product = makeProduct()

    useProductsAdminUIStore.getState().openEdit(product)

    expect(useProductsAdminUIStore.getState()).toMatchObject({
      formMode: 'edit',
      selectedProduct: product,
      productPendingDelete: null,
    })
  })

  it('opens delete state with the selected product', () => {
    const product = makeProduct()

    useProductsAdminUIStore.getState().openDelete(product)

    expect(useProductsAdminUIStore.getState()).toMatchObject({
      formMode: null,
      selectedProduct: null,
      productPendingDelete: product,
    })
  })

  it('resets dialog state', () => {
    useProductsAdminUIStore.getState().openEdit(makeProduct())

    useProductsAdminUIStore.getState().closeDialogs()

    expect(useProductsAdminUIStore.getState()).toMatchObject({
      formMode: null,
      selectedProduct: null,
      productPendingDelete: null,
    })
  })
})
