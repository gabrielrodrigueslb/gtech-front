import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PWARegister } from './pwa-register';
import '../styles/globals.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lintra Tech - Painel',
  description: 'Sistema de CRM interno da Lintra Tech',
  manifest:'/manifest.json',
  themeColor: "#3b82f6",
  icons: {
    icon: [
      { url: '/icon.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.png', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport = {
  themeColor: "#3b82f6",
  width:'device-width',
  initialScale:1,
  maximumScale:1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} antialiased`}>
        <PWARegister/>
        {children}
      </body>
    </html>
  );
}