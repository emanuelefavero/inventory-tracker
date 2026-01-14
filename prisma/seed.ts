import { Prisma, PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

// Products only - users will come from Clerk authentication
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

  // Create products
  const createdProducts = []
  for (const p of productData) {
    const product = await prisma.product.create({ data: p })
    createdProducts.push(product)
    console.log(`Created product with id: ${product.id}`)
  }

  console.log('Seeding finished.')
  console.log('')
  console.log(
    '📝 Note: Users will be created automatically when they sign in via Clerk.',
  )
  console.log(
    '👤 To make yourself an admin, add your email to ADMIN_EMAILS in .env',
  )
  console.log('   Example: ADMIN_EMAILS=your-email@example.com')
}

main()
