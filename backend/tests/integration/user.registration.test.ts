import request from 'supertest'
import { app } from '@/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('User Registration Flow Integration', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-integration' } },
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should complete full user registration and login flow', async () => {
    const userRegistration = {
      email: 'test-integration@modishcarts.com',
      password: 'securepassword123',
      firstName: 'Integration',
      lastName: 'Test',
      phone: '+1555000001',
    }

    // Step 1: Register new user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userRegistration)
      .expect(201)

    expect(registerResponse.body.success).toBe(true)
    expect(registerResponse.body.user.email).toBe(userRegistration.email)

    const userId = registerResponse.body.user.id

    // Step 2: Login with new credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userRegistration.email,
        password: userRegistration.password,
      })
      .expect(200)

    expect(loginResponse.body.success).toBe(true)
    expect(loginResponse.body.token).toBeDefined()
    expect(loginResponse.body.user.id).toBe(userId)

    const authToken = loginResponse.body.token

    // Step 3: Access protected endpoint with token
    const protectedResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)

    expect(protectedResponse.body.user.id).toBe(userId)
    expect(protectedResponse.body.user.email).toBe(userRegistration.email)

    // Step 4: Update user profile
    const updateResponse = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1555000002',
      })
      .expect(200)

    expect(updateResponse.body.user.firstName).toBe('Updated')
    expect(updateResponse.body.user.lastName).toBe('Name')

    // Step 5: Verify data persistence in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    expect(dbUser).toBeTruthy()
    expect(dbUser!.firstName).toBe('Updated')
    expect(dbUser!.lastName).toBe('Name')
    expect(dbUser!.phone).toBe('+1555000002')
  })

  it('should handle duplicate email registration gracefully', async () => {
    const userRegistration = {
      email: 'duplicate-test-integration@modishcarts.com',
      password: 'password123',
      firstName: 'First',
      lastName: 'User',
    }

    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send(userRegistration)
      .expect(201)

    // Attempt to register with same email
    const duplicateResponse = await request(app)
      .post('/api/auth/register')
      .send({
        ...userRegistration,
        firstName: 'Second',
        lastName: 'User',
      })
      .expect(409)

    expect(duplicateResponse.body.success).toBe(false)
    expect(duplicateResponse.body.error).toContain('email already exists')

    // Verify only one user exists
    const users = await prisma.user.findMany({
      where: { email: userRegistration.email },
    })

    expect(users).toHaveLength(1)
    expect(users[0].firstName).toBe('First')
  })

  it('should handle password reset flow', async () => {
    const userRegistration = {
      email: 'password-reset-test@modishcarts.com',
      password: 'originalpassword123',
      firstName: 'Reset',
      lastName: 'Test',
    }

    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userRegistration)
      .expect(201)

    const userId = registerResponse.body.user.id

    // Request password reset
    const resetRequestResponse = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: userRegistration.email })
      .expect(200)

    expect(resetRequestResponse.body.success).toBe(true)
    expect(resetRequestResponse.body.message).toContain('reset token sent')

    // Note: In real implementation, reset token would be sent via email
    // For testing, we'll assume we have the token
    const resetToken = 'mock-reset-token'

    // Reset password with token
    const newPassword = 'newpassword123'
    const resetResponse = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        password: newPassword,
      })
      .expect(200)

    expect(resetResponse.body.success).toBe(true)

    // Verify old password no longer works
    await request(app)
      .post('/api/auth/login')
      .send({
        email: userRegistration.email,
        password: userRegistration.password,
      })
      .expect(401)

    // Verify new password works
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: userRegistration.email,
        password: newPassword,
      })
      .expect(200)

    expect(loginResponse.body.success).toBe(true)
    expect(loginResponse.body.user.id).toBe(userId)
  })
})