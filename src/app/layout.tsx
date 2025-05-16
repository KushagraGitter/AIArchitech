import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a clean sans-serif font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Keep variable name for consistency with existing shadcn
});


export const metadata: Metadata = {
  title: 'Architech AI',
  description: 'Practice system design, create architecture diagrams, and get AI-powered feedback.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
