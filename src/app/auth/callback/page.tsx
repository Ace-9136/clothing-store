'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (data.session) {
          // User is authenticated
          const user = data.session.user;
          
          // Check if user profile exists, if not create it
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!profile) {
            // Create user profile for new OAuth users
            await supabase.from('user_profiles').insert([
              {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              },
            ]);
          }

          // Redirect to home or dashboard
          router.push('/');
        } else {
          // No session, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
