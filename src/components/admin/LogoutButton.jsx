'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center space-x-3 text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors mt-8"
    >
      <LogOut size={20} />
      <span>Cerrar Sesión</span>
    </button>
  );
}
