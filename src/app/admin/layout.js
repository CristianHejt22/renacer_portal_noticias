import Link from "next/link";
import { LayoutDashboard, FileText, Settings, Share2, DollarSign, Image, LayoutGrid, Globe } from "lucide-react";

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
          <Link href="/admin/categories" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <LayoutGrid size={20} />
            <span>Categorías</span>
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
            <span>Banners Propios</span>
          </Link>
          <Link href="/admin/social" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Share2 size={20} />
            <span>Redes Sociales</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center space-x-3 text-foreground hover:text-primary p-2 rounded-lg hover:bg-white/5 transition-colors">
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
