import request from 'supertest'
import { app } from '@/index'

describe('GET /api/products/:id', () => {
  it('should return a single product by ID', async () => {
    const productId = 'test-product-id'

    const response = await request(app)
      .get(`/api/products/${productId}`)
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toMatchObject({
      id: productId,
      name: expect.any(String),
      slug: expect.any(String),
      description: expect.any(String),
      sku: expect.any(String),
      price: expect.any(Number),
      categoryId: expect.any(String),
      inventoryQty: expect.any(Number),
      isActive: expect.any(Boolean),
      category: expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        slug: expect.any(String),
      }),
      images: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          url: expect.any(String),
          altText: expect.any(String),
          sortOrder: expect.any(Number),
        }),
      ]),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  it('should include product variants if available', async () => {
    const productId = 'test-product-with-variants'

    const response = await request(app)
      .get(`/api/products/${productId}`)
      .expect(200)

    expect(response.body).toHaveProperty('variants')
    expect(Array.isArray(response.body.variants)).toBe(true)
  })

  it('should include approved reviews', async () => {
    const productId = 'test-product-with-reviews'

    const response = await request(app)
      .get(`/api/products/${productId}`)
      .expect(200)

    expect(response.body).toHaveProperty('reviews')
    expect(Array.isArray(response.body.reviews)).toBe(true)
    
    if (response.body.reviews.length > 0) {
      expect(response.body.reviews[0]).toMatchObject({
        id: expect.any(String),
        rating: expect.any(Number),
        title: expect.any(String),
        comment: expect.any(String),
        isApproved: true,
        user: expect.objectContaining({
          firstName: expect.any(String),
          lastName: expect.any(String),
        }),
      })
    }
  })

  it('should return 404 for non-existent product', async () => {
    const response = await request(app)
      .get('/api/products/non-existent-id')
      .expect(404)

    expect(response.body).toHaveProperty('error')
    expect(response.body.error).toContain('not found')
  })

  it('should return 400 for invalid product ID format', async () => {
    const response = await request(app)
      .get('/api/products/invalid-id-format')
      .expect(400)

    expect(response.body).toHaveProperty('error')
  })

  it('should not return inactive products to regular users', async () => {
    const inactiveProductId = 'inactive-product-id'

    const response = await request(app)
      .get(`/api/products/${inactiveProductId}`)
      .expect(404)

    expect(response.body).toHaveProperty('error')
  })
})