# Deployment Guide - Clothing Store

## Vercel Deployment Steps

### Prerequisites
- GitHub account with your repository pushed
- Vercel account (https://vercel.com)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin master
```

### Step 2: Import Project to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables
In Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these values:**
1. Go to your Supabase project at https://supabase.com
2. Project Settings → API
3. Copy the "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "anon" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the "service_role" key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Configure Supabase for Vercel Domain
1. Go to your Supabase project
2. Authentication → URL Configuration
3. Add your Vercel domain to "Redirect URLs":
   - `https://your-domain.vercel.app/auth/callback`
   - `https://your-domain.vercel.app/auth/login`
   - `https://your-domain.vercel.app/auth/signup`

### Step 5: Deploy
Click "Deploy" button in Vercel. The build will start automatically.

## Production Checklist

- ✅ Build succeeds without errors
- ✅ Environment variables configured
- ✅ Supabase project accessible from Vercel domain
- ✅ Database tables created (user_profiles, products, orders, order_items)
- ✅ RLS (Row Level Security) policies configured
- ✅ Authentication redirects working

## Troubleshooting

### Build fails with "Missing environment variables"
- Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are added in Vercel settings
- These are **public** variables and safe to expose

### Authentication redirects not working
- Add your Vercel domain to Supabase URL Configuration
- Check that domain matches exactly (including https://)

### Database connection errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` is the correct HTTPS URL
- Should be like `https://xxxxx.supabase.co` (not a PostgreSQL connection string)

### Pages load but show "Loading..." indefinitely
- Check browser console for errors
- Ensure Supabase credentials are correct
- Verify user is authenticated for protected pages

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

## Database Schema

All required tables must exist in Supabase:

- `user_profiles` - User account information
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Items in each order

See Supabase project for RLS policies.
