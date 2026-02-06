import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { CRMProvider } from '@/context/crm-context';

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
