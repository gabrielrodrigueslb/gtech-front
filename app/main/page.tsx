'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/sidebar';
import Dashboard from '@/components/dashboard';
import Contacts from '@/components/contacts';
import Deals from '@/components/deals';
import Tasks from '@/components/tasks';
import Analytics from '@/components/analytics';
import { CRMProvider } from '@/context/crm-context';
import { getMe } from '@/lib/auth';

export default function CRMApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const me = await getMe();

        if (!me) {
          router.push('/');
          return;
        }

        setUser(me);
      } catch {
        router.push('/');
      } finally {
        setLoadingAuth(false);
      }
    }

    checkAuth();
  }, [router]);

  async function handleLogout() {
    await fetch('http://localhost:3333/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    router.push('/');
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'contacts':
        return <Contacts />;
      case 'deals':
        return <Deals />;
      case 'tasks':
        return <Tasks />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <CRMProvider>
      <div className="flex min-h-screen gap-2">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-7 flex flex-col overflow-auto min-h-full w-full ">
          <header className="flex justify-end pb-4">
            <div className="user-infos flex items-center gap-4 ">
              <span className="flex items-center justify-center h-full font-bold">
                  {user?.name}
                </span>
              <div
                className="h-12 w-12 bg-amber-400 rounded-full relative cursor-pointer"
                onClick={toggleMenu}
                ref={menuRef}
              >
                <span className="flex items-center justify-center h-full font-bold">
                  {user?.name?.[0]}
                </span>
                <div
                  className={`profile-menu w-55  rounded-2xl bg-(--color-card-hover) absolute top-[150%] right-0 z-50 shadow-lg overflow-hidden ${
                    menuOpen
                      ? 'opacity-100 transition-opacity duration-100'
                      : 'opacity-0 pointer-events-none'
                  } transition-opacity duration-100`}
                >
                  <ul className="w-full flex flex-col justify-center items-center">
                    <li className="py-6 cursor-pointer w-full text-center profile-menu-link">
                      Perfil
                    </li>
                    <li className="py-6 cursor-pointer w-full profile-menu-link text-center">
                      Configurações
                    </li>
                    <li
                      className="py-6 cursor-pointer w-full profile-menu-link text-center"
                      onClick={handleLogout}
                    >
                      Sair
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </header>
          {renderContent()}
        </main>
      </div>
    </CRMProvider>
  );
}
