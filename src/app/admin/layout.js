import Link from "next/link";
import { LayoutDashboard, FileText, Settings, Share2, DollarSign, Image as ImageIcon, LayoutGrid, Globe, Tag, Tool, BarChart, ShieldAlert, Zap, LogOut } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function getRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return 'USER';
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload.role || 'USER';
  } catch (e) {
    return 'USER';
  }
}

export default async function AdminLayout({ children }) {
  const role = await getRole();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Profesional */}
      <aside className="w-64 border-r border-border/40 bg-black/40 backdrop-blur-xl p-6 hidden md:flex flex-col shadow-2xl relative z-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Admin Pro</h2>
        </div>
        
        <nav className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Main Group */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">General</p>
            <div className="space-y-1">
              <Link href="/admin" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <LayoutDashboard size={18} className="group-hover:text-primary transition-colors" />
                <span className="font-medium text-sm">Dashboard</span>
              </Link>
              <Link href="/admin/posts" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <FileText size={18} className="group-hover:text-accent transition-colors" />
                <span className="font-medium text-sm">Noticias</span>
              </Link>
              <Link href="/admin/categories" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                <LayoutGrid size={18} className="group-hover:text-blue-400 transition-colors" />
                <span className="font-medium text-sm">Categorías</span>
              </Link>
            </div>
          </div>

          {/* Mostrar solo a los ADMIN */}
          {role === 'ADMIN' && (
            <>
              {/* Clasificados Group */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Comercio</p>
                <div className="space-y-1">
                  <Link href="/admin/clasificados" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Tag size={18} className="group-hover:text-green-400 transition-colors" />
                    <span className="font-medium text-sm">Clasificados</span>
                  </Link>
                  <Link href="/admin/clasificados/categorias" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group pl-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-border group-hover:bg-green-400 transition-colors"></span>
                    <span className="font-medium text-sm text-muted-foreground group-hover:text-white transition-colors">Cat. Clasificados</span>
                  </Link>
                </div>
              </div>

              {/* Marketing & Ads */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Marketing</p>
                <div className="space-y-1">
                  <Link href="/admin/ads" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Zap size={18} className="group-hover:text-yellow-400 transition-colors" />
                    <span className="font-medium text-sm">Scripts Adsterra</span>
                  </Link>
                  <Link href="/admin/banners" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <ImageIcon size={18} className="group-hover:text-pink-400 transition-colors" />
                    <span className="font-medium text-sm">Planes Publicitarios</span>
                  </Link>
                  <Link href="/admin/popups" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Tag size={18} className="group-hover:text-orange-400 transition-colors" />
                    <span className="font-medium text-sm">Popups Promocionales</span>
                  </Link>
                  <Link href="/admin/purchases" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <DollarSign size={18} className="group-hover:text-green-500 transition-colors" />
                    <span className="font-medium text-sm">Pagos y Solicitudes</span>
                  </Link>
                </div>
              </div>

              {/* Herramientas */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Herramientas</p>
                <div className="space-y-1">
                  <Link href="/admin/users" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-indigo-400 transition-colors"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <span className="font-medium text-sm">Gestión Usuarios</span>
                  </Link>
                  <Link href="/admin/pages" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Globe size={18} className="group-hover:text-cyan-400 transition-colors" />
                    <span className="font-medium text-sm">Constructor Páginas</span>
                  </Link>
                  <Link href="/admin/social" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Share2 size={18} className="group-hover:text-purple-400 transition-colors" />
                    <span className="font-medium text-sm">Redes Sociales</span>
                  </Link>
                  <button className="w-full flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-not-allowed opacity-50" title="Próximamente">
                    <BarChart size={18} className="group-hover:text-orange-400 transition-colors" />
                    <span className="font-medium text-sm">Analíticas Avanzadas</span>
                  </button>
                </div>
              </div>

              {/* Sistema */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Sistema</p>
                <div className="space-y-1">
                  <Link href="/admin/settings" className="flex items-center space-x-3 text-foreground/80 hover:text-white p-2.5 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    <Settings size={18} className="group-hover:text-gray-300 transition-colors" />
                    <span className="font-medium text-sm">Configuración Global</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </nav>

        <div className="pt-6 mt-6 border-t border-border/40">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content con fondo sutil */}
      <main className="flex-1 p-4 md:p-8 relative bg-gradient-to-br from-background via-background to-black/20 overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-3xl rounded-full -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
