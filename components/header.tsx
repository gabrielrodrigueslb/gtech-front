'use client'

import { getMe } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Header() {
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    router.replace('/');
  }

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
    <header className="flex justify-between p-4 items-center">
            <div className="px-4">
              <div className="flex items-center justify-center">
                <div className="w-20 h-auto flex ">
                  <img
                    className="w-full h-auto"
                    src="/logo_dark.png"
                    alt="logo lintra"
                  />
                </div>
              </div>
            </div>
            <div className="user-infos flex items-center gap-4 px-4">
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
  )
}
