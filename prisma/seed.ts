import {
  MovementType,
  Prisma,
  PrismaClient,
  Role,
} from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

const userData: Prisma.UserCreateInput[] = [
  {
    email: 'admin@inventory.com',
    name: 'Admin User',
    role: Role.ADMIN,
  },
  {
    email: 'user@inventory.com',
    name: 'Regular User',
    role: Role.USER,
  },
]

const productData: Prisma.ProductCreateInput[] = [
  {
    sku: 'LAP-001',
    name: 'Dell XPS 15 Laptop',
    category: 'Electronics',
    quantity: 10,
  },
  {
    sku: 'MOU-001',
    name: 'Logitech MX Master 3',
    category: 'Electronics',
    quantity: 25,
  },
  {
    sku: 'CHR-001',
    name: 'Office Chair',
    category: 'Furniture',
    quantity: 15,
  },
  {
    sku: 'PEN-001',
    name: 'Ballpoint Pens (Box of 50)',
    category: 'Office Supplies',
    quantity: 100,
  },
]

export async function main() {
  console.log('Start seeding...')

  // Create users
  const createdUsers = []
  for (const u of userData) {
    const user = await prisma.user.create({ data: u })
    createdUsers.push(user)
    console.log(`Created user with id: ${user.id}`)
  }

  // Create products
  const createdProducts = []
  for (const p of productData) {
    const product = await prisma.product.create({ data: p })
    createdProducts.push(product)
    console.log(`Created product with id: ${product.id}`)
  }

  // Create some sample inventory movements
  const adminUser = createdUsers.find((u) => u.role === Role.ADMIN)
  const regularUser = createdUsers.find((u) => u.role === Role.USER)

  if (adminUser && createdProducts.length > 0) {
    // Admin adds stock for laptop
    const movement1 = await prisma.inventoryMovement.create({
      data: {
        userId: adminUser.id,
        productId: createdProducts[0].id,
        type: MovementType.IN,
        quantity: 10,
      },
    })
    console.log(`Created inventory movement with id: ${movement1.id}`)

    // Admin adds stock for mouse
    const movement2 = await prisma.inventoryMovement.create({
      data: {
        userId: adminUser.id,
        productId: createdProducts[1].id,
        type: MovementType.IN,
        quantity: 25,
      },
    })
    console.log(`Created inventory movement with id: ${movement2.id}`)
  }

  if (regularUser && createdProducts.length > 1) {
    // User removes some mice
    const movement3 = await prisma.inventoryMovement.create({
      data: {
        userId: regularUser.id,
        productId: createdProducts[1].id,
        type: MovementType.OUT,
        quantity: 5,
      },
    })
    console.log(`Created inventory movement with id: ${movement3.id}`)
  }

  console.log('Seeding finished.')
}

main()
