'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseHelpers } from '@/lib/supabase';

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await supabaseHelpers.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          const admin = await supabaseHelpers.getIsAdmin(currentUser.id);
          setIsAdmin(admin);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabaseHelpers.signOut();
      setUser(null);
      setIsAdmin(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">ClothingStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shop" className="text-gray-700 hover:text-indigo-600 font-medium">
              Shop
            </Link>
            {user && (
              <>
                <Link href="/cart" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Cart
                </Link>
                <Link href="/orders" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Orders
                </Link>
              </>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-gray-700 hover:text-indigo-600 font-medium">
                Admin
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link
              href="/shop"
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Shop
            </Link>
            {user && (
              <>
                <Link
                  href="/cart"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cart
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Orders
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Admin
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="block px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
