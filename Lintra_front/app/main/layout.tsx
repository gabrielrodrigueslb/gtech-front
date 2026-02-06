import type { Metadata } from 'next';
import Sidebar from '@/components/sidebar';
import { CRMProvider } from '@/context/crm-context';

export const metadata: Metadata = {
  title: 'Painel - Lintra Tech',
  description: 'Sistema de CRM interno da Lintra Tech',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon_light.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.png', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  robots: {
    index: false,
    follow: false,
  },
  verification:{
    google: 'Livqowmo0Ajv9D6E0i5wyzParTYzc6r9pS6noxyZ0WE',
  }
};


export const viewport = {
  themeColor: '#11182b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-screen flex-col-reverse md:flex-row flex w-screen overflow-hidden animate-in transition-opacity
        duration-300 ease-in-out"
    >

      {/* CONTEÚDO ABAIXO DO HEADER */}
      <main className="flex flex-1  min-h-0">
        {/* SIDEBAR */}
        <Sidebar />

        {/* ÁREA DAS PÁGINAS */}
        <div className="flex-1 overflow-auto min-h-0 section-content p-6">
          <CRMProvider>{children}</CRMProvider>
        </div>
      </main>
    </div>
  );
}
