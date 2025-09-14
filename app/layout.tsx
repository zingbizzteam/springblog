import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BlogCMS - Modern Blog Management System',
  description: 'A modern, SEO-optimized blog management system built with Next.js and TypeScript',
  keywords: ['blog', 'cms', 'nextjs', 'typescript', 'tailwind'],
  authors: [{ name: 'BlogCMS Team' }],
  creator: 'BlogCMS',
  publisher: 'BlogCMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'BlogCMS - Modern Blog Management System',
    description: 'A modern, SEO-optimized blog management system built with Next.js and TypeScript',
    siteName: 'BlogCMS',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BlogCMS - Modern Blog Management System',
    description: 'A modern, SEO-optimized blog management system built with Next.js and TypeScript',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
