import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@modishcarts.com' },
    update: {},
    create: {
      email: 'admin@modishcarts.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
    },
  })

  console.log('✅ Created admin user:', adminUser.email)

  // Create test user
  const testPassword = await bcrypt.hash('test123', 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@modishcarts.com' },
    update: {},
    create: {
      email: 'test@modishcarts.com',
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create categories
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://images.unsplash.com/photo-1518276780018-1f4e79b5ac8d?w=400',
    },
    {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel for all occasions',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    },
    {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home and garden needs',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books, magazines, and educational materials',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(created)
    console.log('✅ Created category:', created.name)
  }

  // Create sample products
  const products = [
    {
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      description: 'High-quality wireless headphones with noise cancellation and long battery life.',
      shortDesc: 'Premium wireless headphones with crystal clear sound',
      sku: 'WBH-001',
      price: 149.99,
      comparePrice: 199.99,
      categoryId: createdCategories.find((c) => c.slug === 'electronics')!.id,
      inventoryQty: 50,
      weight: 0.3,
      isFeatured: true,
      tags: ['wireless', 'bluetooth', 'noise-cancellation', 'premium'],
      metaTitle: 'Wireless Bluetooth Headphones - Premium Audio Experience',
      metaDesc: 'Experience superior sound quality with our wireless Bluetooth headphones featuring noise cancellation.',
    },
    {
      name: 'Classic Cotton T-Shirt',
      slug: 'classic-cotton-t-shirt',
      description: 'Comfortable 100% cotton t-shirt in various colors. Perfect for casual wear.',
      shortDesc: 'Soft and comfortable cotton t-shirt',
      sku: 'CCT-001',
      price: 24.99,
      comparePrice: 34.99,
      categoryId: createdCategories.find((c) => c.slug === 'clothing')!.id,
      inventoryQty: 100,
      weight: 0.2,
      isFeatured: true,
      tags: ['cotton', 'casual', 'comfortable', 'unisex'],
      metaTitle: 'Classic Cotton T-Shirt - Comfortable Casual Wear',
      metaDesc: 'Soft and comfortable 100% cotton t-shirt perfect for everyday wear.',
    },
    {
      name: 'Smart Home Security Camera',
      slug: 'smart-home-security-camera',
      description: 'WiFi-enabled security camera with 1080p HD video, night vision, and mobile app control.',
      shortDesc: '1080p HD WiFi security camera with night vision',
      sku: 'SHSC-001',
      price: 89.99,
      comparePrice: 129.99,
      categoryId: createdCategories.find((c) => c.slug === 'electronics')!.id,
      inventoryQty: 25,
      weight: 0.5,
      tags: ['security', 'wifi', 'hd', 'night-vision', 'smart-home'],
      metaTitle: 'Smart Home Security Camera - 1080p HD WiFi Surveillance',
      metaDesc: 'Keep your home secure with our WiFi-enabled HD security camera featuring night vision.',
    },
    {
      name: 'Ceramic Plant Pot Set',
      slug: 'ceramic-plant-pot-set',
      description: 'Set of 3 beautiful ceramic plant pots in different sizes, perfect for indoor plants.',
      shortDesc: 'Set of 3 decorative ceramic plant pots',
      sku: 'CPPS-001',
      price: 39.99,
      categoryId: createdCategories.find((c) => c.slug === 'home-garden')!.id,
      inventoryQty: 30,
      weight: 1.2,
      tags: ['ceramic', 'plants', 'home-decor', 'indoor', 'set'],
      metaTitle: 'Ceramic Plant Pot Set - Beautiful Home Decor',
      metaDesc: 'Enhance your home with our beautiful set of 3 ceramic plant pots.',
    },
    {
      name: 'The Art of Programming',
      slug: 'the-art-of-programming',
      description: 'Comprehensive guide to modern programming techniques and best practices.',
      shortDesc: 'Essential programming guide for developers',
      sku: 'TAP-001',
      price: 59.99,
      categoryId: createdCategories.find((c) => c.slug === 'books')!.id,
      inventoryQty: 40,
      weight: 0.8,
      tags: ['programming', 'development', 'technical', 'education'],
      metaTitle: 'The Art of Programming - Complete Developer Guide',
      metaDesc: 'Master programming with our comprehensive guide covering modern techniques and best practices.',
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    })
    createdProducts.push(created)
    console.log('✅ Created product:', created.name)

    // Add product images
    await prisma.productImage.createMany({
      data: [
        {
          productId: created.id,
          url: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop`,
          altText: `${created.name} - Main Image`,
          sortOrder: 0,
        },
        {
          productId: created.id,
          url: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop`,
          altText: `${created.name} - Secondary Image`,
          sortOrder: 1,
        },
      ],
    })
  }

  // Create test addresses for test user
  await prisma.address.createMany({
    data: [
      {
        userId: testUser.id,
        type: 'SHIPPING',
        firstName: 'Test',
        lastName: 'User',
        street1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        isDefault: true,
      },
      {
        userId: testUser.id,
        type: 'BILLING',
        firstName: 'Test',
        lastName: 'User',
        street1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        postalCode: '12345',
        country: 'US',
        isDefault: true,
      },
    ],
  })

  console.log('✅ Created test addresses')

  // Create sample cart items for test user
  const sampleProduct = createdProducts[0]
  await prisma.cartItem.create({
    data: {
      userId: testUser.id,
      productId: sampleProduct.id,
      quantity: 2,
    },
  })

  console.log('✅ Created sample cart items')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })