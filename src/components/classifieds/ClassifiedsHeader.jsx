'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, PlusSquare, Package, User } from 'lucide-react';

export default function ClassifiedsHeader() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', path: '/clasificados', icon: Store },
    { name: 'Publicar', path: '/clasificados/publicar', icon: PlusSquare },
    { name: 'Paquetes PYMES', path: '/paquetes', icon: Package },
    { name: 'Mi Cuenta', path: '/mi-cuenta', icon: User },
  ];

  return (
    <div className="bg-surface glass border-b border-border sticky top-[64px] z-40 mb-8 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center md:justify-start space-x-2 md:space-x-8 overflow-x-auto py-3 hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-semibold ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
