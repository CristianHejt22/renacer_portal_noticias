'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, LogOut, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserClassifieds } from '@/app/actions/classifieds';
import { logout } from '@/app/actions/auth';

export default function UserDashboard() {
  const router = useRouter();
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyAds();
  }, []);

  const loadMyAds = async () => {
    setLoading(true);
    const res = await getUserClassifieds();
    if (res.success && res.data) {
      setClassifieds(res.data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface glass sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">Mi Portal</Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
              Volver al Inicio
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-sm text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Mi Cuenta</h1>
            <p className="text-gray-400">Gestiona tus avisos clasificados publicados</p>
          </div>
          <Link 
            href="/clasificados/publicar" 
            className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary-rgb),0.5)]"
          >
            <Plus size={20} className="mr-2" />
            Publicar Aviso
          </Link>
        </div>

        <div className="bg-surface glass rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Tag className="mr-2 text-primary" size={24} />
            Mis Clasificados
          </h2>

          {loading ? (
            <div className="text-center text-gray-400 py-12">Cargando tus avisos...</div>
          ) : classifieds.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Tag className="text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Aún no tienes avisos</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">Empieza a vender, alquilar o promocionar tus servicios hoy mismo publicando tu primer clasificado.</p>
              <Link href="/clasificados/publicar" className="text-primary font-semibold hover:underline">
                Publicar mi primer aviso
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {classifieds.map(ad => (
                <div key={ad.id} className="bg-background border border-border rounded-xl p-4 flex flex-col h-full hover:border-primary/50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 truncate">{ad.title}</h3>
                    <p className="text-sm text-gray-400 mb-4">{ad.category?.name || 'General'}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        {ad.isActive ? (
                          <span className="flex items-center text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            <CheckCircle size={14} className="mr-1" /> Activo
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                            <Clock size={14} className="mr-1" /> En revisión / Pausado
                          </span>
                        )}
                      </div>
                      
                      {ad.isFeatured && (
                        <div className="flex items-center text-sm">
                          <span className="flex items-center text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
                            Destacado hasta: {new Date(ad.featuredUntil).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-auto flex justify-between items-center">
                    <span className="font-bold text-primary">
                      {ad.price ? `$${ad.price}` : 'Consultar'}
                    </span>
                    <Link href={`/clasificados/${ad.slug}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                      Ver aviso
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
