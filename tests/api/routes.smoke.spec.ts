import { expect, test } from '@playwright/test'

type ApiRouteCase = {
  name: string
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  body?: Record<string, unknown>
}

const cases: ApiRouteCase[] = [
  { name: 'products list', method: 'GET', path: '/api/products' },
  {
    name: 'products create',
    method: 'POST',
    path: '/api/products',
    body: {
      sku: 'SKU-001',
      name: 'Keyboard',
      category: 'Peripherals',
      quantity: 1,
    },
  },
  {
    name: 'products update',
    method: 'PATCH',
    path: '/api/products/test-id',
    body: { name: 'Updated Name' },
  },
  { name: 'products delete', method: 'DELETE', path: '/api/products/test-id' },
  { name: 'movements list', method: 'GET', path: '/api/movements' },
  {
    name: 'checkout movement',
    method: 'POST',
    path: '/api/movements/checkout',
    body: { productId: 'test-product', quantity: 1 },
  },
  {
    name: 'return movement',
    method: 'POST',
    path: '/api/movements/return',
    body: { productId: 'test-product', quantity: 1 },
  },
  { name: 'users list', method: 'GET', path: '/api/users' },
  {
    name: 'users role update',
    method: 'PATCH',
    path: '/api/users/test-user/role',
    body: { role: 'ADMIN' },
  },
]

for (const routeCase of cases) {
  test(`${routeCase.method} ${routeCase.path} (${routeCase.name}) returns 401 AUTH_UNAUTHENTICATED`, async ({
    request,
  }) => {
    const response = await request.fetch(routeCase.path, {
      method: routeCase.method,
      data: routeCase.body,
      headers: routeCase.body
        ? {
            'content-type': 'application/json',
          }
        : undefined,
    })

    const body = await response.json()

    expect(response.status()).toBe(401)
    expect(body.ok).toBe(false)
    expect(body.error.code).toBe('AUTH_UNAUTHENTICATED')
  })
}
