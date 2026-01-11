# Google OAuth Setup Guide

## Overview
Your application now supports Google authentication. Users can sign up and sign in directly with their Google accounts without creating a manual password-based account.

## Features Added
- ✅ "Sign in with Google" button on login page
- ✅ "Sign up with Google" button on signup page  
- ✅ Automatic user profile creation for OAuth users
- ✅ Auth callback handler for OAuth redirect
- ✅ Seamless redirect after authentication

## Setup Steps for Vercel Deployment

### Step 1: Enable Google OAuth in Supabase
1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and toggle it **ON**
4. You'll see a prompt asking for OAuth credentials

### Step 2: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one)
3. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
4. Choose **Web application**
5. Add **Authorized redirect URIs** (from Supabase Google provider settings):
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`
6. Copy the **Client ID** and **Client Secret**

### Step 3: Configure in Supabase
1. Paste the **Client ID** and **Client Secret** into Supabase Google provider settings
2. Save the configuration
3. Note the **Redirect URL** shown in Supabase (you'll need this for Google Cloud)

### Step 4: Update Vercel Environment (Optional)
If you want OAuth to work in development:
- Your Supabase project needs to be public (default)
- Local development at http://localhost:3000 should work automatically
- Production domain needs to be added to Google OAuth credentials

## How It Works

### User Flow
1. User clicks "Sign in with Google" button
2. User is redirected to Google login
3. User authenticates with Google
4. User is redirected back to `/auth/callback`
5. App checks if user profile exists, creates if needed
6. User is logged in and redirected to home page

### Code Components
- **`src/lib/supabase.ts`**: `signInWithGoogle()` function
- **`src/app/auth/callback/page.tsx`**: OAuth callback handler
- **`src/app/auth/login/page.tsx`**: Login page with Google button
- **`src/app/auth/signup/page.tsx`**: Signup page with Google button

## Troubleshooting

### "Invalid redirect URI" Error
- Make sure your redirect URL matches exactly what's registered in Google Cloud
- Check both localhost AND production URLs are registered
- URLs are case-sensitive

### "OAuth provider is disabled" Error
- Go back to Supabase → Authentication → Providers
- Make sure Google is toggled ON
- Credentials are saved correctly

### Redirect loop or blank page after Google login
- Check browser console for errors
- Verify Supabase credentials are correct in .env.local
- Make sure `/auth/callback` route exists

### Getting "Unauthorized" after clicking button
- Verify Google OAuth credentials in Supabase are valid
- Check that Supabase project URL matches your redirect URLs
- Make sure you have the correct Client ID/Secret from Google

## Local Testing
```bash
# Make sure you have these in .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here

# Run development server
npm run dev

# Visit http://localhost:3000/auth/login
# Click "Sign in with Google"
```

## Production Deployment
1. Add your Vercel domain redirect URL to Google Cloud credentials
2. Ensure Supabase is configured with your production domain
3. Deploy to Vercel
4. Test Google authentication on your production domain

## Files Modified
- `src/lib/supabase.ts` - Added `signInWithGoogle()` function
- `src/app/auth/login/page.tsx` - Added Google login button
- `src/app/auth/signup/page.tsx` - Added Google signup button
- `src/app/auth/callback/page.tsx` - Created OAuth callback handler
