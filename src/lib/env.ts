/**
 * Environment variable validation
 * Checks if required environment variables are set
 */

export const ENV = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export function validateEnv() {
  const missing: string[] = [];

  if (!ENV.NEXT_PUBLIC_SUPABASE_URL) {
    missing.push('NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Make sure these are set in your .env.local or Vercel environment settings.`
    );
    return false;
  }

  return true;
}

// Validate on client-side if we're in a browser
if (typeof window !== 'undefined') {
  const isValid = validateEnv();
  if (!isValid) {
    console.warn('⚠️ Environment variables not properly configured');
  }
}
