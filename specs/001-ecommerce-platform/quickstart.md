# QuickStart Development Guide - ModishCarts E-commerce Platform

**Setup Time**: ~30 minutes  
**Prerequisites**: Node.js 18+, Git, VS Code (recommended)  
**Stack**: Next.js + Express.js + PostgreSQL + Prisma

---

## 🚀 One-Command Setup

```bash
# Clone and setup everything
git clone <repository-url> modish-carts
cd modish-carts
npm run setup
```

The `setup` script will:
1. Install dependencies for frontend and backend
2. Setup environment files
3. Start local database (Docker)
4. Run database migrations
5. Seed initial data
6. Start development servers

---

## 📋 Manual Setup (If Preferred)

### 1. Prerequisites Installation

```bash
# Install Node.js 18+ (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Docker Desktop (for local database)
# Download from: https://www.docker.com/products/docker-desktop

# Install VS Code extensions (recommended)
code --install-extension bradlc.vscode-tailwindcss
code --install-extension Prisma.prisma
code --install-extension ms-typescript.vscode-typescript
```

### 2. Repository Setup

```bash
# Clone repository
git clone <repository-url> modish-carts
cd modish-carts

# Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

### 3. Environment Configuration

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit environment files with your values
```

**Frontend Environment** (`.env.local`):
```env
# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Stripe Configuration (get from https://stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

**Backend Environment** (`.env`):
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/modishcarts"

# Authentication
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=12

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional for MVP)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App Configuration
PORT=8000
NODE_ENV=development
```

### 4. Database Setup

```bash
# Start PostgreSQL with Docker
docker run --name postgres-modish \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=modishcarts \
  -p 5432:5432 \
  -d postgres:15

# Run database migrations
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Development Servers

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend App
cd frontend
npm run dev

# Terminal 3: Database Management (optional)
cd backend
npx prisma studio
```

**Access Points**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Prisma Studio: http://localhost:5555

---

## 🛠️ Development Workflow

### Daily Development

```bash
# Start everything (from project root)
npm run dev

# Run tests
npm run test

# Check code quality
npm run lint
npm run type-check

# Database operations
npm run db:migrate    # Create new migration
npm run db:reset      # Reset database
npm run db:seed       # Seed test data
```

### Code Generation

```bash
# Generate Prisma client (after schema changes)
cd backend
npx prisma generate

# Generate API documentation
npm run docs:generate

# Create new component (frontend)
cd frontend
npm run generate:component ComponentName

# Create new API endpoint (backend)
cd backend
npm run generate:endpoint endpoint-name
```

---

## 🧪 Testing

### Running Tests

```bash
# All tests
npm run test

# Frontend tests only
cd frontend && npm run test

# Backend tests only  
cd backend && npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── frontend/
│   ├── components/      # Component unit tests
│   ├── pages/          # Page integration tests
│   └── utils/          # Utility function tests
├── backend/
│   ├── unit/           # Service/utility unit tests
│   ├── integration/    # API endpoint tests
│   └── contract/       # API contract tests
└── e2e/                # End-to-end user journey tests
```

### Writing Tests

**Frontend Component Test**:
```typescript
// frontend/tests/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';

describe('ProductCard', () => {
  it('displays product information', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 29.99,
      image: '/test.jpg'
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });
});
```

**Backend API Test**:
```typescript
// backend/tests/integration/products.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('Products API', () => {
  it('GET /api/products returns product list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
      
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
  });
});
```

---

## 🚢 Deployment

### Development Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production (requires confirmation)
npm run deploy:production
```

### Manual Deployment

**Frontend (Vercel)**:
```bash
cd frontend
npx vercel --prod
```

**Backend (Railway)**:
```bash
cd backend
railway login
railway deploy
```

**Database Migration (Production)**:
```bash
# Apply migrations to production
cd backend
DATABASE_URL="<production-url>" npx prisma migrate deploy
```

---

## 📊 Monitoring and Analytics

### Local Development Monitoring

```bash
# View application logs
npm run logs

# Monitor database queries
npx prisma studio

# Check performance
npm run lighthouse

# Monitor API performance
npm run api:monitor
```

### Production Monitoring Setup

1. **Vercel Analytics**: Automatic with deployment
2. **Sentry Error Tracking**: Configure in environment variables
3. **Stripe Dashboard**: Monitor payments at dashboard.stripe.com
4. **Database Monitoring**: Available in Railway dashboard

---

## 🔧 Common Tasks

### Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Update database schema (if needed)
cd backend
# Edit prisma/schema.prisma
npx prisma migrate dev --name add-new-feature

# 3. Generate API contracts
npm run generate:api-docs

# 4. Create tests (TDD approach)
# Write failing tests first

# 5. Implement feature
# Make tests pass

# 6. Run full test suite
npm run test

# 7. Check code quality
npm run lint
npm run type-check

# 8. Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### Debugging Common Issues

**Database Connection Issues**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker restart postgres-modish

# Check connection
cd backend
npx prisma db push
```

**Environment Variable Issues**:
```bash
# Verify environment variables are loaded
cd frontend && npm run env:check
cd backend && npm run env:check

# Recreate environment files
cp .env.example .env.local
```

**Build Issues**:
```bash
# Clear all caches
npm run clean
npm install

# Rebuild everything
npm run build
```

---

## 📚 Documentation

### API Documentation
- **Swagger UI**: http://localhost:8000/docs (when backend running)
- **OpenAPI Specs**: Located in `specs/001-ecommerce-platform/contracts/`

### Code Documentation
- **Frontend Components**: Documented with JSDoc in component files
- **Backend APIs**: Documented with OpenAPI specifications
- **Database Schema**: Auto-generated docs with Prisma

### Architecture Documentation
- **System Architecture**: See `docs/architecture.md`
- **Database Design**: See `specs/001-ecommerce-platform/data-model.md`
- **API Design**: See contract files in `contracts/` directory

---

## 🆘 Troubleshooting

### Getting Help

1. **Check the FAQ**: `docs/FAQ.md`
2. **Search Issues**: GitHub repository issues
3. **Development Chat**: Slack/Discord channel
4. **Documentation**: Full docs at `/docs/`

### Common Solutions

**"Module not found" errors**:
```bash
rm -rf node_modules package-lock.json
npm install
```

**Database sync issues**:
```bash
cd backend
npx prisma db push --force-reset
npx prisma db seed
```

**TypeScript errors**:
```bash
# Restart TypeScript server in VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
npm run type-check
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend API responds at http://localhost:8000/health
- [ ] Database connection works (Prisma Studio accessible)
- [ ] Tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Can create a test product via admin interface
- [ ] Can add product to cart and proceed to checkout
- [ ] Stripe test payments work in development mode

**Success!** You're ready to start developing ModishCarts! 🎉

---

**Next Steps**: Review the project specification and begin implementing features following the TDD approach outlined in our constitution.