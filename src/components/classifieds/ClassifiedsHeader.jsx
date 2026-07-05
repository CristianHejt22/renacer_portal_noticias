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
        <nav className="flex justify-start lg:justify-start gap-2 overflow-x-auto py-3 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 font-semibold text-xs md:text-sm ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
