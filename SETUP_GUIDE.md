# Environment Setup Instructions

## Required Dependencies

Ensure you have installed all required packages:

```bash
npm install @supabase/supabase-js zustand
```

## Environment Variables

Create a `.env.local` file in the project root with the following:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Node Environment
NODE_ENV=development
```

## How to Get Your Supabase Credentials

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details
5. Wait for project to be created

### Step 2: Get API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** → Paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → Paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → Paste as `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Create Database Tables
1. Go to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Run the following SQL to create all tables:

```sql
-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL,
  full_name VARCHAR,
  phone VARCHAR,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create products table
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

-- Create orders table
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

-- Create order_items table
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

### Step 4: Enable Row Level Security (RLS)

Run these queries in SQL Editor to secure your data:

```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products: Anyone can see active products
CREATE POLICY "products_readable_by_all" ON products
  FOR SELECT USING (is_active = true);

-- Admin can manage all products
CREATE POLICY "products_admin_only" ON products
  FOR ALL USING (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE));

-- Enable RLS on orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can see their own orders
CREATE POLICY "orders_user_can_view_own" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Admin can see all orders
CREATE POLICY "orders_admin_can_view_all" ON orders
  FOR SELECT USING (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE));

-- Users can create orders for themselves
CREATE POLICY "orders_user_can_insert" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable RLS on order_items table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can see items from their orders
CREATE POLICY "order_items_readable" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE user_id = auth.uid() 
      OR auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE)
    )
  );

-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "user_profiles_readable" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Admin can read all profiles
CREATE POLICY "user_profiles_admin_readable" ON user_profiles
  FOR SELECT USING (auth.uid() IN (SELECT id FROM user_profiles WHERE is_admin = TRUE));
```

### Step 5: Create Admin User

After you sign up through the app, run this query to make yourself admin:

```sql
UPDATE user_profiles 
SET is_admin = TRUE 
WHERE email = 'your_email@example.com';
```

### Step 6: Add Sample Products (Optional)

```sql
INSERT INTO products (name, description, price, image_url, category, sizes, colors, stock, is_active)
VALUES 
  (
    'Blue T-Shirt',
    'Comfortable cotton t-shirt in blue color',
    29.99,
    'https://via.placeholder.com/300x300?text=Blue+Tshirt',
    'Shirts',
    '["S", "M", "L", "XL"]'::json,
    '["Blue", "Navy", "Light Blue"]'::json,
    50,
    true
  ),
  (
    'Black Jeans',
    'Classic black denim jeans for all occasions',
    59.99,
    'https://via.placeholder.com/300x300?text=Black+Jeans',
    'Pants',
    '["28", "30", "32", "34"]'::json,
    '["Black"]'::json,
    30,
    true
  ),
  (
    'Red Dress',
    'Elegant red dress perfect for any event',
    79.99,
    'https://via.placeholder.com/300x300?text=Red+Dress',
    'Dresses',
    '["XS", "S", "M", "L"]'::json,
    '["Red", "Dark Red"]'::json,
    20,
    true
  );
```

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` in your browser.

## Verifying Setup

1. **Check Supabase Connection**: Try signing up
2. **Check User Profile**: In Supabase Dashboard → user_profiles table
3. **Check Products**: Add products via admin panel
4. **Check Orders**: Place an order and verify in orders table

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` file exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### "RLS policy violation"
- Check that RLS policies are enabled
- Verify the policies are set correctly for your use case
- Check that user_id matches authenticated user

### "Products not loading"
- Make sure products have `is_active = true`
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY has read permissions

### "Can't access admin panel"
- Run: `UPDATE user_profiles SET is_admin = TRUE WHERE email = 'your_email';`
- Refresh the page

## Database Backup

To backup your data:
1. Go to Supabase Dashboard
2. Click **Database** → **Backups**
3. Create a manual backup
4. Download if needed

## Resetting Database

To reset all tables (WARNING: This deletes all data):

```sql
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Then run the CREATE TABLE statements above
```

## Next Steps

1. ✅ Complete this setup
2. ✅ Create admin user
3. ✅ Add sample products
4. ✅ Test signup/login
5. ✅ Test shopping flow
6. ✅ Deploy to production

For detailed integration guide, see `DATABASE_SETUP.md`
