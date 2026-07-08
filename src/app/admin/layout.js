import Link from "next/link";
import { LayoutDashboard, FileText, Settings, Share2, DollarSign, Image, LayoutGrid, Globe, Tag } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface glass p-6 hidden md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-primary">Panel Admin</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/posts" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <FileText size={20} />
            <span>Noticias</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span>Usuarios</span>
          </Link>
          <Link href="/admin/categories" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <LayoutGrid size={20} />
            <span>Categorías</span>
          </Link>
          <Link href="/admin/clasificados" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Tag size={20} />
            <span>Clasificados</span>
          </Link>
          <Link href="/admin/clasificados/categorias" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors pl-8">
            <span className="text-sm border-l-2 border-border pl-2">Categorías</span>
          </Link>
          <Link href="/admin/pages" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Globe size={20} />
            <span>Páginas</span>
          </Link>
          <Link href="/admin/ads" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <DollarSign size={20} />
            <span>Scripts Adsterra</span>
          </Link>
          <Link href="/admin/banners" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Image size={20} />
            <span>Planes Publicitarios</span>
          </Link>
          <Link href="/admin/purchases" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <DollarSign size={20} />
            <span>Pagos y Solicitudes</span>
          </Link>
          <Link href="/admin/social" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Share2 size={20} />
            <span>Redes Sociales</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
          <LogoutButton />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
