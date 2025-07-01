import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';
import { Navigation } from '@/components/layout/navigation';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'JB Checklists',
  description: 'Digital checklist system for JB staff',
  manifest: '/manifest.json',
  themeColor: '#FDF351',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className='min-h-screen bg-gray-50'>{children}</main>
          <OfflineIndicator />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
