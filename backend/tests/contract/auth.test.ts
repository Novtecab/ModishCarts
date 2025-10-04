import request from 'supertest'
import { app } from '@/index'

describe('Authentication API Endpoints', () => {
  describe('POST /api/auth/login', () => {
    const validCredentials = {
      email: 'test@modishcarts.com',
      password: 'test123',
    }

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(validCredentials)
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        token: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: validCredentials.email,
          firstName: expect.any(String),
          lastName: expect.any(String),
          isAdmin: expect.any(Boolean),
        }),
        expiresAt: expect.any(String),
      })

      // Token should be a valid JWT format
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    })

    it('should return 401 for invalid email', async () => {
      const invalidCredentials = {
        ...validCredentials,
        email: 'nonexistent@example.com',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials'),
      })
    })

    it('should return 401 for invalid password', async () => {
      const invalidCredentials = {
        ...validCredentials,
        password: 'wrongpassword',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid credentials'),
      })
    })

    it('should return 400 for missing email', async () => {
      const invalidData = { password: validCredentials.password }

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('email')
    })

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validCredentials,
        email: 'invalid-email-format',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 for inactive user account', async () => {
      const inactiveUserCredentials = {
        email: 'inactive@modishcarts.com',
        password: 'test123',
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(inactiveUserCredentials)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('account is disabled'),
      })
    })
  })

  describe('POST /api/auth/register', () => {
    const validRegistration = {
      email: 'newuser@modishcarts.com',
      password: 'newpassword123',
      firstName: 'New',
      lastName: 'User',
      phone: '+1234567890',
    }

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistration)
        .expect('Content-Type', /json/)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        user: expect.objectContaining({
          id: expect.any(String),
          email: validRegistration.email,
          firstName: validRegistration.firstName,
          lastName: validRegistration.lastName,
          phone: validRegistration.phone,
          isAdmin: false,
          isActive: true,
        }),
        message: expect.stringContaining('registered successfully'),
      })

      // Should not return password
      expect(response.body.user).not.toHaveProperty('password')
    })

    it('should return 409 for duplicate email', async () => {
      const duplicateEmail = {
        ...validRegistration,
        email: 'test@modishcarts.com', // Already exists
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateEmail)
        .expect(409)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('email already exists'),
      })
    })

    it('should return 400 for weak password', async () => {
      const weakPassword = {
        ...validRegistration,
        password: '123', // Too short
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('password')
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'valid-refresh-token' })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        token: expect.any(String),
        refreshToken: expect.any(String),
        expiresAt: expect.any(String),
      })
    })

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid refresh token'),
      })
    })
  })
})