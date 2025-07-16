


// =======================================================================
// File: src/app/layout.tsx (SIMPLIFIED)
// Purpose: Root layout without theme provider or dark classes.
// =======================================================================
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Link Saver',
  description: 'Save and summarize your links.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        {children}
      </body>
    </html>
  );
}
