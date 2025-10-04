# GitHub Copilot Instructions for ModishCarts E-commerce Platform

This document provides context for GitHub Copilot to assist with the ModishCarts e-commerce platform development.

## Project Overview

**ModishCarts** is a modern e-commerce platform built for small to medium businesses, targeting 1K-10K monthly users initially with scalability to 100K+ users.

### Core Features
- Dynamic product catalog with search and filtering
- Shopping cart with guest and user persistence
- Secure payment processing via Stripe
- User authentication and account management
- Admin dashboard for inventory and order management
- Mobile-first responsive design
- Real-time inventory updates

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router and TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **State Management**: Zustand for client state
- **Authentication**: NextAuth.js with JWT
- **Forms**: React Hook Form with Zod validation
- **Payments**: Stripe React components

### Backend
- **Runtime**: Node.js 18+ with Express.js and TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Zod schemas for API validation
- **File Storage**: Cloudinary for product images
- **Email**: Nodemailer for transactional emails

### Development Tools
- **Testing**: Jest + React Testing Library (frontend), Supertest (backend), Playwright (E2E)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Documentation**: OpenAPI/Swagger for API documentation
- **Deployment**: Vercel (frontend) + Railway (backend + database)

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js 14 app directory
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript type definitions
backend/
├── src/
│   ├── controllers/         # Express route handlers
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models (Prisma)
│   ├── services/            # Business logic layer
│   ├── utils/               # Utility functions
│   └── routes/              # Express routes
shared/
├── types/                   # Shared TypeScript types
└── constants/               # Shared constants
```

## Development Principles (Constitutional Requirements)

### 1. Code Quality Excellence
- Use TypeScript strict mode with comprehensive type safety
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for components/types)
- Write self-documenting code with meaningful variable and function names
- Use constants for magic numbers and strings
- Implement proper error handling with typed error responses

### 2. Test-Driven Development (TDD)
- Write tests before implementation (Red-Green-Refactor cycle)
- Maintain 90%+ code coverage
- Use descriptive test names that explain the scenario and expected outcome
- Mock external dependencies in unit tests
- Include integration tests for all API endpoints

### 3. User Experience Consistency
- Use Shadcn/ui components for consistent design system
- Implement mobile-first responsive design with Tailwind CSS
- Ensure WCAG 2.1 AA accessibility compliance
- Provide clear loading states and error messages
- Implement progressive enhancement

### 4. Performance Standards
- Target <2 second page load times on 3G networks
- API responses must be <500ms for standard operations
- Optimize images and implement lazy loading
- Use Next.js built-in optimizations (code splitting, image optimization)
- Implement proper caching strategies

### 5. Security and Data Protection
- Validate all inputs using Zod schemas
- Use parameterized queries (Prisma handles this automatically)
- Implement proper authentication and authorization
- Hash passwords with bcrypt (12 rounds minimum)
- Never log sensitive information

## Coding Patterns and Best Practices

### API Design Patterns
```typescript
// Controller pattern
export async function getProducts(req: Request, res: Response) {
  try {
    const validation = ProductQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid query parameters' });
    }
    
    const result = await productService.getProducts(validation.data);
    res.json({ data: result.products, pagination: result.pagination });
  } catch (error) {
    logger.error('Failed to get products', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Component Patterns
```typescript
// Component with proper TypeScript and accessibility
interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <Image
          src={product.images[0]?.url || '/placeholder.jpg'}
          alt={product.images[0]?.altText || product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover rounded-md"
        />
        <h3 className="mt-2 font-semibold text-lg">{product.name}</h3>
        <p className="text-muted-foreground">${product.price}</p>
        <Button 
          onClick={() => onAddToCart(product.id)}
          className="w-full mt-2"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Database Patterns
```typescript
// Service layer with proper error handling
export class ProductService {
  async getProducts(filters: ProductFilters): Promise<ProductListResult> {
    try {
      const where = this.buildWhereClause(filters);
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true, images: true },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit,
          orderBy: { [filters.sortBy]: filters.order },
        }),
        prisma.product.count({ where }),
      ]);
      
      return {
        products,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          totalPages: Math.ceil(total / filters.limit),
          totalItems: total,
        },
      };
    } catch (error) {
      logger.error('Failed to fetch products', error);
      throw new ServiceError('Failed to fetch products');
    }
  }
}
```

## Common Tasks and Patterns

### Creating New API Endpoints
1. Define Zod validation schema
2. Create service layer function
3. Implement controller with proper error handling
4. Add route to Express router
5. Write integration tests
6. Update OpenAPI documentation

### Adding New UI Components
1. Create component with TypeScript interface
2. Implement accessibility features
3. Add to Storybook (if available)
4. Write component tests
5. Document props and usage

### Database Schema Changes
1. Update Prisma schema
2. Generate migration: `npx prisma migrate dev`
3. Update TypeScript types
4. Update seed data if necessary
5. Test migration on development database

## Environment and Configuration

### Development Environment Variables
```env
# Frontend (.env.local)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=development-secret
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend (.env)
DATABASE_URL=postgresql://postgres:password@localhost:5432/modishcarts
JWT_SECRET=development-jwt-secret
STRIPE_SECRET_KEY=sk_test_...
PORT=8000
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm run dev",
    "dev:backend": "cd backend && npm run dev",
    "test": "npm run test:frontend && npm run test:backend",
    "build": "npm run build:frontend && npm run build:backend",
    "lint": "npm run lint:frontend && npm run lint:backend"
  }
}
```

## Testing Guidelines

### Unit Test Example
```typescript
describe('ProductService', () => {
  beforeEach(async () => {
    await prisma.product.deleteMany();
  });

  it('should return products with pagination', async () => {
    // Arrange
    await createTestProducts(5);
    const filters = { page: 1, limit: 3, sortBy: 'name', order: 'asc' };

    // Act
    const result = await productService.getProducts(filters);

    // Assert
    expect(result.products).toHaveLength(3);
    expect(result.pagination.totalItems).toBe(5);
    expect(result.pagination.totalPages).toBe(2);
  });
});
```

### Component Test Example
```typescript
describe('ProductCard', () => {
  it('calls onAddToCart when button is clicked', async () => {
    const mockAddToCart = jest.fn();
    const product = createMockProduct();

    render(<ProductCard product={product} onAddToCart={mockAddToCart} />);
    
    await user.click(screen.getByRole('button', { name: /add to cart/i }));
    
    expect(mockAddToCart).toHaveBeenCalledWith(product.id);
  });
});
```

## Performance Optimization

### Frontend Optimizations
- Use Next.js Image component for automatic optimization
- Implement code splitting with dynamic imports
- Use React.memo for expensive components
- Implement virtual scrolling for large product lists
- Use Suspense boundaries for loading states

### Backend Optimizations
- Implement database connection pooling
- Use database indexes for frequently queried fields
- Implement caching for product catalog
- Use pagination for large datasets
- Optimize Prisma queries with proper includes

## Security Considerations

### Authentication & Authorization
```typescript
// Middleware for protected routes
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Input Validation
```typescript
// Always validate inputs with Zod
const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive().max(999999.99),
  categoryId: z.string().cuid(),
  description: z.string().optional(),
});

export function validateCreateProduct(req: Request, res: Response, next: NextFunction) {
  const validation = CreateProductSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: validation.error.issues 
    });
  }
  req.body = validation.data;
  next();
}
```

## Recent Changes and Context
- Implemented Prisma database schema with e-commerce entities
- Set up Next.js 14 with App Router for SEO optimization
- Configured Stripe payment processing with webhook handling
- Implemented JWT authentication with NextAuth.js
- Set up comprehensive testing infrastructure
- Configured Tailwind CSS with Shadcn/ui design system

## Common Issues and Solutions
- **Database connection issues**: Check DATABASE_URL and ensure PostgreSQL is running
- **Type errors**: Run `npx prisma generate` after schema changes
- **Build failures**: Clear .next and node_modules, reinstall dependencies
- **Test failures**: Ensure test database is properly seeded before tests

When helping with code generation, please follow these patterns and maintain consistency with the established architecture and coding standards.