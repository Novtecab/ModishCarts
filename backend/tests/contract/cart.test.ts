import request from 'supertest'
import { app } from '@/index'

describe('Cart API Endpoints', () => {
  describe('GET /api/cart', () => {
    it('should return cart items for authenticated user', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toMatchObject({
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            productId: expect.any(String),
            quantity: expect.any(Number),
            product: expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              price: expect.any(Number),
              images: expect.any(Array),
            }),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
        summary: expect.objectContaining({
          totalItems: expect.any(Number),
          subtotal: expect.any(Number),
        }),
      })
    })

    it('should return guest cart items using session ID', async () => {
      const sessionId = 'guest-session-123'

      const response = await request(app)
        .get(`/api/cart?sessionId=${sessionId}`)
        .expect(200)

      expect(response.body).toHaveProperty('items')
      expect(response.body).toHaveProperty('summary')
    })

    it('should return empty cart for new users', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', 'Bearer new-user-token')
        .expect(200)

      expect(response.body.items).toEqual([])
      expect(response.body.summary.totalItems).toBe(0)
      expect(response.body.summary.subtotal).toBe(0)
    })
  })

  describe('POST /api/cart', () => {
    const validCartItem = {
      productId: 'test-product-id',
      quantity: 2,
    }

    it('should add item to authenticated user cart', async () => {
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(validCartItem)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(response.body).toMatchObject({
        id: expect.any(String),
        productId: validCartItem.productId,
        quantity: validCartItem.quantity,
        userId: expect.any(String),
        product: expect.objectContaining({
          name: expect.any(String),
          price: expect.any(Number),
        }),
      })
    })

    it('should add item to guest cart with session ID', async () => {
      const sessionId = 'guest-session-123'
      const cartData = { ...validCartItem, sessionId }

      const response = await request(app)
        .post('/api/cart')
        .send(cartData)
        .expect(201)

      expect(response.body).toMatchObject({
        productId: validCartItem.productId,
        quantity: validCartItem.quantity,
        sessionId: sessionId,
      })
    })

    it('should update quantity if item already exists', async () => {
      // First add item
      await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(validCartItem)
        .expect(201)

      // Add same item again
      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send({ ...validCartItem, quantity: 3 })
        .expect(200)

      expect(response.body.quantity).toBe(5) // 2 + 3
    })

    it('should return 400 for invalid product ID', async () => {
      const invalidData = { ...validCartItem, productId: 'invalid-id' }

      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 for invalid quantity', async () => {
      const invalidData = { ...validCartItem, quantity: 0 }

      const response = await request(app)
        .post('/api/cart')
        .set('Authorization', 'Bearer valid-jwt-token')
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should require authentication or session ID', async () => {
      const response = await request(app)
        .post('/api/cart')
        .send(validCartItem)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('authentication or session')
    })
  })
})