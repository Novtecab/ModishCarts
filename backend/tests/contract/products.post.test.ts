import request from 'supertest'
import { app } from '@/index'

describe('POST /api/products', () => {
  const validProductData = {
    name: 'Test Product',
    slug: 'test-product',
    description: 'A test product description',
    sku: 'TST-001',
    price: 29.99,
    categoryId: 'test-category-id',
    inventoryQty: 10,
  }

  it('should create a new product with valid data', async () => {
    const response = await request(app)
      .post('/api/products')
      .send(validProductData)
      .expect('Content-Type', /json/)
      .expect(201)

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: validProductData.name,
      slug: validProductData.slug,
      sku: validProductData.sku,
      price: validProductData.price,
      categoryId: validProductData.categoryId,
      inventoryQty: validProductData.inventoryQty,
      isActive: true,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('should return 400 for missing required fields', async () => {
    const invalidData = { ...validProductData }
    delete invalidData.name

    const response = await request(app)
      .post('/api/products')
      .send(invalidData)
      .expect(400)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toContain('name')
  })

  it('should return 400 for invalid price', async () => {
    const invalidData = { ...validProductData, price: -10 }

    const response = await request(app)
      .post('/api/products')
      .send(invalidData)
      .expect(400)

    expect(response.body).toHaveProperty('error')
  })

  it('should return 409 for duplicate SKU', async () => {
    // First create a product
    await request(app)
      .post('/api/products')
      .send(validProductData)
      .expect(201)

    // Try to create another with same SKU
    const duplicateData = { ...validProductData, name: 'Different Name' }

    const response = await request(app)
      .post('/api/products')
      .send(duplicateData)
      .expect(409)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toContain('SKU')
  })

  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/products')
      .send(validProductData)
      // Remove auth header
      .expect(401)

    expect(response.body).toHaveProperty('error')
  })
})