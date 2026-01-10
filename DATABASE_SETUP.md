# Database Integration Guide

This document details all the database-related changes made to integrate with your Supabase tables.

## Database Tables

The application uses the following Supabase tables:

### 1. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR,
  category VARCHAR,
  sizes JSON DEFAULT '[]',
  colors JSON DEFAULT '[]',
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  customer_name VARCHAR NOT NULL,
  customer_email VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR NOT NULL,
  zip_code VARCHAR NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR DEFAULT 'cash_on_delivery',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. order_items
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  size VARCHAR,
  color VARCHAR,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Updated Files

### 1. `/src/lib/supabase.ts`
Complete refactor with proper database integration:
- **signUp()**: Creates user and user_profiles entry
- **getProducts()**: Fetches active products with pagination
- **getProductById()**: Retrieves single product details
- **createOrder()**: Creates order with delivery details
- **createOrderItems()**: Associates products with orders
- **getOrdersByUserId()**: Retrieves user's orders
- **updateOrderStatus()**: Admin can update order status
- **getStats()**: Dashboard statistics
- **getIsAdmin()**: Check admin privileges

### 2. `/src/app/auth/signup/page.tsx`
- Integrated with supabaseHelpers.signUp()
- Automatically creates user_profiles entry
- Email validation and password matching
- Success/error feedback

### 3. `/src/app/auth/login/page.tsx`
- Integrated with supabaseHelpers.signIn()
- Redirects to /shop on successful login
- Error handling for invalid credentials

### 4. `/src/app/shop/page.tsx`
- Fetches products from products table
- Displays only active products (is_active = true)
- Shows stock status
- Filters out-of-stock items

### 5. `/src/app/product/[id]/page.tsx`
- Fetches individual product with details
- Displays sizes and colors from JSON arrays
- Cart integration with Zustand store
- Stock validation

### 6. `/src/app/cart/page.tsx`
- Complete checkout flow
- Creates order in orders table
- Creates order_items for each product
- Integrates with delivery form
- Cash on Delivery payment method

### 7. `/src/app/orders/page.tsx`
- Fetches user's orders from orders table
- Shows order status with color coding
- Links to order details

### 8. `/src/app/order-confirmation/[id]/page.tsx`
- Retrieves order details from orders table
- Fetches associated order_items
- Shows delivery address and payment info
- Displays product details

### 9. `/src/app/admin/page.tsx`
- Admin authentication check using is_admin flag
- Three tabs: Dashboard, Orders, Products
- Dashboard: Real-time stats
- Orders Tab: View and update order status (pending → processing → shipped → delivered)
- Products Tab: Add new products with sizes and colors

### 10. `/src/components/Header.tsx`
- User authentication state detection
- Conditional navigation based on auth status
- Admin panel link for authorized users
- Logout functionality

## Key Features Implemented

### Authentication
- Email/password signup with automatic user_profiles creation
- Session management with Supabase Auth
- Admin role verification

### Products Management
- Display active products only
- Product details with images, sizes, colors
- Stock management
- Admin can add new products

### Shopping Cart
- Add to cart with Zustand state management
- Product quantity management
- Size selection

### Checkout Process
1. User views cart
2. Proceeds to checkout
3. Fills delivery details
4. Creates order in orders table
5. Creates order_items for each product
6. Redirects to confirmation page

### Order Management
- Users view their orders
- Real-time order status tracking
- Admin can update order status
- Complete order history

### Admin Features
- Dashboard with stats (orders, revenue, products, customers)
- Order management with status updates
- Product management (add new products)
- User must have is_admin = true to access

## Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Row Level Security (RLS)

Recommended RLS policies:

```sql
-- Products: Everyone can see active products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_readable_by_all" ON products
  FOR SELECT USING (is_active = true);
CREATE POLICY "products_admin_only" ON products
  FOR ALL USING (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE));

-- Orders: Users see their own, admins see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_user_can_view_own" ON orders
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_admin_can_view_all" ON orders
  FOR SELECT USING (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE));

-- Order Items: Users see their orders' items, admins see all
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_readable" ON order_items
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id = auth.uid() OR auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE))
  );
```

## Admin Setup

1. Sign up through the app
2. In Supabase SQL Editor, run:
   ```sql
   UPDATE user_profiles SET is_admin = TRUE WHERE email = 'your_email@example.com';
   ```
3. User now has access to /admin panel

## Flow Diagrams

### User Registration
```
Sign Up → supabaseHelpers.signUp() → auth.users created → user_profiles created → Login
```

### Shopping Flow
```
Browse Products → Add to Cart (Zustand) → Checkout → Create Order → Create Order Items → Confirmation
```

### Order Management
```
User Places Order → Status: pending → Admin Updates → shipped/delivered → User Sees Update
```

## Testing Checklist

- [ ] User can sign up and create account
- [ ] User profile is created automatically
- [ ] User can log in
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout creates order in DB
- [ ] Order items are saved
- [ ] User can view orders
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can add products
- [ ] Product stock is tracked

## Troubleshooting

### Orders not showing
- Check RLS policies are enabled
- Verify user_id in orders matches authenticated user

### Products not loading
- Verify is_active = true for products
- Check NEXT_PUBLIC_SUPABASE_URL and key

### Admin panel not accessible
- Check is_admin = true in user_profiles
- Verify authentication

## Next Steps

1. Set up RLS policies for security
2. Create admin user
3. Add test products
4. Test complete shopping flow
5. Enable notifications for order updates
6. Add payment gateway (optional, currently Cash on Delivery)
