import { ProductDetail } from '@/lib/products/types'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type FormMode = 'create' | 'edit' | null

type ProductsAdminUIState = {
  formMode: FormMode
  selectedProduct: ProductDetail | null
  productPendingDelete: ProductDetail | null
  openCreate: () => void
  openEdit: (product: ProductDetail) => void
  openDelete: (product: ProductDetail) => void
  closeDialogs: () => void
}

export const useProductsAdminUIStore = create<ProductsAdminUIState>()(
  devtools(
    (set) => ({
      formMode: null,
      selectedProduct: null,
      productPendingDelete: null,
      openCreate: () =>
        set(
          {
            formMode: 'create',
            selectedProduct: null,
            productPendingDelete: null,
          },
          false,
          'products-admin-ui/openCreate',
        ),
      openEdit: (product) =>
        set(
          {
            formMode: 'edit',
            selectedProduct: product,
            productPendingDelete: null,
          },
          false,
          'products-admin-ui/openEdit',
        ),
      openDelete: (product) =>
        set(
          {
            formMode: null,
            selectedProduct: null,
            productPendingDelete: product,
          },
          false,
          'products-admin-ui/openDelete',
        ),
      closeDialogs: () =>
        set(
          {
            formMode: null,
            selectedProduct: null,
            productPendingDelete: null,
          },
          false,
          'products-admin-ui/closeDialogs',
        ),
    }),
    { name: 'products-admin-ui' },
  ),
)
