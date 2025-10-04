import { PrismaClient } from '@prisma/client'

// Global test setup
global.beforeAll(async () => {
  // Test database setup if needed
})

global.afterAll(async () => {
  // Cleanup
})

// Mock console.log in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}