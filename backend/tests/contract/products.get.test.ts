import request from 'supertest'
import { app } from '@/index'

describe('GET /api/products', () => {
  it('should return a list of products', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toHaveProperty('data')
    expect(response.body).toHaveProperty('pagination')
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  it('should support pagination parameters', async () => {
    const response = await request(app)
      .get('/api/products?page=1&limit=10')
      .expect(200)

    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalPages: expect.any(Number),
      totalItems: expect.any(Number),
    })
  })

  it('should support category filtering', async () => {
    const response = await request(app)
      .get('/api/products?categoryId=test-category-id')
      .expect(200)

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          categoryId: 'test-category-id',
        }),
      ])
    )
  })

  it('should support search functionality', async () => {
    const response = await request(app)
      .get('/api/products?search=test')
      .expect(200)

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.stringContaining('test'),
        }),
      ])
    )
  })

  it('should return 400 for invalid pagination parameters', async () => {
    const response = await request(app)
      .get('/api/products?page=0&limit=-1')
      .expect(400)

    expect(response.body).toHaveProperty('error')
  })
})