'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaTasks } from 'react-icons/fa';
import { FaBuildingUser } from 'react-icons/fa6';
import { LuLayoutDashboard } from 'react-icons/lu';
import { MdLeaderboard } from 'react-icons/md';
import { TiContacts } from 'react-icons/ti';

export default function Sidebar() {
  const pathname = usePathname();
  const menuItems = [
    {
      id: 1,
      path: '/main/dashboard',
      label: 'Dashboard',
      icon: <LuLayoutDashboard />,
    },
    { id: 2, path: '/main/contacts', label: 'Contatos', icon: <TiContacts /> },
    { id: 3, path: '/main/crm', label: 'Negocios', icon: <MdLeaderboard /> },
    {
      id: 4,
      path: '/main/clientes',
      label: 'Clientes',
      icon: <FaBuildingUser />,
    },
    { id: 5, path: '/main/tasks', label: 'Tarefas', icon: <FaTasks /> },
  ];

  return (
    <aside className="m-3 md:py-10 bg-sidebar-foreground rounded-3xl shadow-lg shrink-0 flex flex-col md:items-center max-md:overflow-scroll">
      <Image src="/logo_dark.png" width={20} height={20} className='w-15 pb-10 select-none hidden md:block' alt="" />
      <nav className=" h-full w-24  p-4">
        <ul className=" flex flex-row md:flex-col gap-3 items-center">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                className={` w-full flex items-center bg-sidebar-foreground py-4 px-7 rounded-4xl text-sidebar text-2xl ${
                  pathname == item.path ? 'bg-sidebar-primary  text-white' : 'hover:bg-sidebar-border hover:text-sidebar-primary-foreground'
                }`}
              >
                  {item.icon}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
