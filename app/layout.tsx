import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/providers/AuthProvider';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'AI Commerce - E-commerce Analytics Powered by AI',
  description: 'Smarter than Metric.vn - AI-powered e-commerce analytics for TikTok Shop, Shopee, Lazada',
  keywords: ['e-commerce', 'analytics', 'AI', 'TikTok Shop', 'Shopee', 'Lazada', 'Vietnam'],
  authors: [{ name: 'AI Commerce Team' }],
  openGraph: {
    title: 'AI Commerce - E-commerce Analytics',
    description: 'AI-powered analytics for e-commerce sellers',
    type: 'website',
    locale: 'vi_VN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Commerce - E-commerce Analytics',
    description: 'AI-powered analytics for e-commerce sellers',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}