# Data Model Design - ModishCarts E-commerce Platform

**Database**: PostgreSQL with Prisma ORM  
**Design Philosophy**: Relational data model optimized for e-commerce transactions  
**Generated From**: Feature specification requirements and entity analysis

---

## Database Schema Overview

```prisma
// User Management
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  password    String   // Hashed with bcrypt
  firstName   String?
  lastName    String?
  phone       String?
  isActive    Boolean  @default(true)
  isAdmin     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  addresses   Address[]
  orders      Order[]
  reviews     Review[]
  cartItems   CartItem[]
  
  @@map("users")
}

// Address Management
model Address {
  id          String  @id @default(cuid())
  userId      String
  type        AddressType // BILLING, SHIPPING
  firstName   String
  lastName    String
  company     String?
  street1     String
  street2     String?
  city        String
  state       String
  postalCode  String
  country     String
  isDefault   Boolean @default(false)
  
  // Relationships
  user        User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  orders      Order[]
  
  @@map("addresses")
}

// Product Catalog
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  parentId    String?
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relationships
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  products    Product[]
  
  @@map("categories")
}

model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String?
  shortDesc     String?
  sku           String    @unique
  price         Decimal   @db.Decimal(10,2)
  comparePrice  Decimal?  @db.Decimal(10,2)
  costPrice     Decimal?  @db.Decimal(10,2)
  trackInventory Boolean  @default(true)
  inventoryQty  Int       @default(0)
  lowStockThreshold Int   @default(5)
  weight        Decimal?  @db.Decimal(8,2)
  dimensions    Json?     // {length, width, height}
  isActive      Boolean   @default(true)
  isFeatured    Boolean   @default(false)
  tags          String[]
  metaTitle     String?
  metaDesc      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relationships
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  images        ProductImage[]
  variants      ProductVariant[]
  reviews       Review[]
  cartItems     CartItem[]
  orderItems    OrderItem[]
  
  @@map("products")
}

model ProductImage {
  id          String  @id @default(cuid())
  productId   String
  url         String
  altText     String?
  sortOrder   Int     @default(0)
  
  // Relationships
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@map("product_images")
}

model ProductVariant {
  id          String  @id @default(cuid())
  productId   String
  name        String  // e.g., "Size: Large, Color: Red"
  sku         String  @unique
  price       Decimal @db.Decimal(10,2)
  inventoryQty Int    @default(0)
  attributes  Json    // {size: "L", color: "red"}
  isActive    Boolean @default(true)
  
  // Relationships
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  cartItems   CartItem[]
  orderItems  OrderItem[]
  
  @@map("product_variants")
}

// Shopping Cart
model CartItem {
  id          String   @id @default(cuid())
  userId      String?  // Null for guest carts
  sessionId   String?  // For guest users
  productId   String
  variantId   String?
  quantity    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  user        User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  product     Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant     ProductVariant? @relation(fields: [variantId], references: [id], onDelete: Cascade)
  
  @@unique([userId, productId, variantId])
  @@unique([sessionId, productId, variantId])
  @@map("cart_items")
}

// Order Management
model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  userId          String?
  email           String
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  fulfillmentStatus FulfillmentStatus @default(UNFULFILLED)
  
  // Pricing
  subtotal        Decimal     @db.Decimal(10,2)
  taxAmount       Decimal     @db.Decimal(10,2)
  shippingAmount  Decimal     @db.Decimal(10,2)
  discountAmount  Decimal     @db.Decimal(10,2) @default(0)
  totalAmount     Decimal     @db.Decimal(10,2)
  
  // Addresses
  shippingAddressId String?
  billingAddressId  String?
  
  // Metadata
  currency        String      @default("USD")
  notes           String?
  cancelReason    String?
  cancelledAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relationships
  user            User?       @relation(fields: [userId], references: [id])
  shippingAddress Address?    @relation(fields: [shippingAddressId], references: [id])
  items           OrderItem[]
  payments        Payment[]
  
  @@map("orders")
}

model OrderItem {
  id          String  @id @default(cuid())
  orderId     String
  productId   String
  variantId   String?
  quantity    Int
  unitPrice   Decimal @db.Decimal(10,2)
  totalPrice  Decimal @db.Decimal(10,2)
  
  // Product snapshot at time of order
  productName String
  productSku  String
  variantName String?
  
  // Relationships
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product         @relation(fields: [productId], references: [id])
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  
  @@map("order_items")
}

// Payment Processing
model Payment {
  id              String        @id @default(cuid())
  orderId         String
  paymentIntentId String        @unique // Stripe Payment Intent ID
  amount          Decimal       @db.Decimal(10,2)
  currency        String        @default("USD")
  status          PaymentStatus @default(PENDING)
  paymentMethod   PaymentMethod
  metadata        Json?         // Stripe metadata
  failureReason   String?
  processedAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Relationships
  order           Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@map("payments")
}

// Customer Reviews
model Review {
  id          String   @id @default(cuid())
  productId   String
  userId      String
  rating      Int      // 1-5 stars
  title       String?
  comment     String?
  isVerified  Boolean  @default(false) // Verified purchase
  isApproved  Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([productId, userId]) // One review per user per product
  @@map("reviews")
}

// Enums
enum AddressType {
  BILLING
  SHIPPING
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
}

enum FulfillmentStatus {
  UNFULFILLED
  PARTIAL
  FULFILLED
  SHIPPED
  DELIVERED
}

enum PaymentMethod {
  CARD
  PAYPAL
  APPLE_PAY
  GOOGLE_PAY
  BANK_TRANSFER
}
```

---

## Entity Relationships and Business Rules

### User Management
- **Users** can have multiple **Addresses** (billing, shipping)
- **Users** can place multiple **Orders**
- **Users** can write multiple **Reviews** (one per product)
- **Users** can have **CartItems** (persistent cart)

### Product Catalog
- **Categories** support hierarchical organization (parent/children)
- **Products** belong to one **Category** but support multiple **Tags**
- **Products** can have multiple **ProductImages** and **ProductVariants**
- **ProductVariants** enable size/color/style options with separate pricing/inventory

### Shopping Cart
- **CartItems** support both authenticated users (userId) and guests (sessionId)
- Unique constraints prevent duplicate cart entries
- Cart persistence based on user authentication state

### Order Processing
- **Orders** capture complete transaction state with pricing breakdown
- **OrderItems** store product snapshots to maintain historical accuracy
- Address relationships enable different billing/shipping addresses
- Status tracking covers order lifecycle, payment, and fulfillment

### Payment Processing
- **Payments** link to Stripe Payment Intents for PCI compliance
- Support for multiple payment methods and currencies
- Comprehensive status tracking and failure reason capture

### Reviews and Ratings
- One review per user per product (enforced by unique constraint)
- Verified purchase flag for enhanced trust
- Approval workflow for content moderation

---

## Data Validation Rules

### Product Validation
```typescript
const productValidation = {
  name: z.string().min(1).max(255),
  price: z.number().positive().max(999999.99),
  inventoryQty: z.number().int().min(0),
  weight: z.number().positive().optional(),
  sku: z.string().regex(/^[A-Z0-9-]+$/), // Alphanumeric with hyphens
}
```

### Order Validation
```typescript
const orderValidation = {
  email: z.string().email(),
  subtotal: z.number().positive(),
  totalAmount: z.number().positive(),
  items: z.array(z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().positive().max(10),
  })).min(1),
}
```

### Cart Validation
```typescript
const cartValidation = {
  quantity: z.number().int().positive().max(10),
  sessionId: z.string().uuid().optional(),
  userId: z.string().cuid().optional(),
}
```

---

## Indexing Strategy

### Performance Indexes
```sql
-- Product catalog performance
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_products_price ON products(price, is_active);

-- Search optimization
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || description));

-- Order performance
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

-- Cart performance
CREATE INDEX idx_cart_user ON cart_items(user_id, created_at DESC);
CREATE INDEX idx_cart_session ON cart_items(session_id, created_at DESC);

-- Review performance
CREATE INDEX idx_reviews_product_approved ON reviews(product_id, is_approved, created_at DESC);
```

### Unique Constraints
```sql
-- Prevent duplicate cart items
ALTER TABLE cart_items ADD CONSTRAINT unique_user_cart_item UNIQUE(user_id, product_id, variant_id);
ALTER TABLE cart_items ADD CONSTRAINT unique_session_cart_item UNIQUE(session_id, product_id, variant_id);

-- Ensure unique product identifiers
ALTER TABLE products ADD CONSTRAINT unique_product_slug UNIQUE(slug);
ALTER TABLE products ADD CONSTRAINT unique_product_sku UNIQUE(sku);

-- One review per user per product
ALTER TABLE reviews ADD CONSTRAINT unique_user_product_review UNIQUE(user_id, product_id);
```

---

## Data Migration Strategy

### Initial Migration
1. **Core Tables**: Users, Categories, Products
2. **E-commerce Tables**: Cart, Orders, Payments
3. **Feature Tables**: Reviews, Addresses
4. **Indexes and Constraints**: Performance and data integrity

### Seed Data Requirements
```typescript
// Categories
const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Home & Garden", slug: "home-garden" },
];

// Sample Products
const products = [
  {
    name: "Sample T-Shirt",
    sku: "TSH-001",
    price: 29.99,
    categoryId: "clothing-category-id",
    inventoryQty: 100,
  },
];
```

### Data Backup and Recovery
- **Daily automated backups** via Railway
- **Point-in-time recovery** capability
- **Migration rollback procedures** for schema changes
- **Data export functionality** for compliance requirements

---

## Scalability Considerations

### Read Optimization
- **Product catalog caching** (Redis for high-traffic products)
- **Database read replicas** for product searches
- **CDN caching** for product images and static content

### Write Optimization
- **Connection pooling** via Prisma
- **Batch operations** for cart and order updates
- **Async processing** for non-critical operations (emails, analytics)

### Storage Optimization
- **Image optimization** via Cloudinary
- **Archive old orders** (move to cold storage after 2 years)
- **Inventory tracking** with real-time updates

---

## Security and Compliance

### Data Protection
- **PII encryption** for sensitive user data
- **Password hashing** with bcrypt (12 rounds)
- **Payment data isolation** (Stripe handles sensitive payment info)
- **GDPR compliance** with data export/deletion capabilities

### Access Control
- **Row-level security** for user data isolation
- **Admin role separation** from customer data
- **API rate limiting** to prevent abuse
- **SQL injection protection** via Prisma's parameterized queries

---

## Testing Data Model

### Unit Tests
```typescript
// Model validation tests
describe('Product Model', () => {
  it('should validate required fields', () => {
    expect(() => Product.create({ name: '' })).toThrow();
  });
  
  it('should calculate inventory status', () => {
    const product = Product.create({ inventoryQty: 3, lowStockThreshold: 5 });
    expect(product.isLowStock()).toBe(true);
  });
});
```

### Integration Tests
```typescript
// Database relationship tests
describe('Order Relationships', () => {
  it('should create order with items', async () => {
    const order = await prisma.order.create({
      data: {
        orderNumber: 'ORD-001',
        email: 'test@example.com',
        items: {
          create: [{ productId: 'prod-1', quantity: 2, unitPrice: 29.99 }]
        }
      },
      include: { items: true }
    });
    
    expect(order.items).toHaveLength(1);
  });
});
```

---

**Next Phase**: API contract generation based on this data model structure.