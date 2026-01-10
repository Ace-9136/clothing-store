import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { validateEnv } from '@/lib/env';

export const metadata: Metadata = {
  title: 'ClothingStore - Your Fashion Destination',
  description: 'Shop stylish and affordable clothing for everyone',
};

// Validate environment variables at build time
if (typeof process !== 'undefined') {
  validateEnv();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
