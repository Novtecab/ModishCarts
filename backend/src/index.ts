import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

const app = express()
const PORT = process.env.PORT || 8000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API routes (to be implemented)
app.use('/api/products', (req, res) => {
  res.status(501).json({ error: 'Products API not implemented yet' })
})

app.use('/api/cart', (req, res) => {
  res.status(501).json({ error: 'Cart API not implemented yet' })
})

app.use('/api/auth', (req, res) => {
  res.status(501).json({ error: 'Auth API not implemented yet' })
})

app.use('/api/orders', (req, res) => {
  res.status(501).json({ error: 'Orders API not implemented yet' })
})

app.use('/api/payments', (req, res) => {
  res.status(501).json({ error: 'Payments API not implemented yet' })
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
  })
}

export { app }