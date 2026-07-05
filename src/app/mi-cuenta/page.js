'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, LogOut, CheckCircle, Clock, Trash2, RotateCw, Star, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserClassifieds, deleteClassified, republishClassified, highlightClassified } from '@/app/actions/classifieds';
import { logout } from '@/app/actions/auth';

export default function UserDashboard() {
  const router = useRouter();
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este aviso permanentemente?')) return;
    setActionLoading(true);
    const res = await deleteClassified(id);
    if (res.success) {
      alert('Aviso eliminado');
      loadMyAds();
    } else {
      alert(res.error || 'Error al eliminar');
    }
    setActionLoading(false);
  };

  const handleRepublish = async (id) => {
    if (!confirm('Republicar consumirá 1 Crédito Normal y reiniciará los 30 días de publicación. ¿Deseas continuar?')) return;
    setActionLoading(true);
    const res = await republishClassified(id);
    if (res.success) {
      alert('Aviso republicado con éxito');
      loadMyAds();
    } else {
      alert(res.error || 'Error al republicar');
    }
    setActionLoading(false);
  };

  const handleHighlight = async (id) => {
    if (!confirm('Destacar este aviso consumirá 1 Crédito Destacado por 7 días. ¿Deseas continuar?')) return;
    setActionLoading(true);
    const res = await highlightClassified(id);
    if (res.success) {
      alert('Aviso destacado con éxito');
      loadMyAds();
    } else {
      alert(res.error || 'Error al destacar');
    }
    setActionLoading(false);
  };

  const getStatus = (ad) => {
    const createdAt = new Date(ad.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    
    let isFeaturedActive = false;
    if (ad.isFeatured && ad.featuredUntil) {
      isFeaturedActive = new Date(ad.featuredUntil) > now;
    }

    if (daysSinceCreation > 37) {
      return { label: 'Eliminado por Vencimiento', color: 'text-red-500 bg-red-500/10', expired: true, pendingDelete: true };
    }
    if (daysSinceCreation > 30) {
      return { label: `Vencido (Se borrará en ${37 - daysSinceCreation} días)`, color: 'text-yellow-500 bg-yellow-500/10', expired: true, pendingDelete: false };
    }
    return { 
      label: ad.isActive ? 'Activo' : 'Pausado', 
      color: ad.isActive ? 'text-green-500 bg-green-500/10' : 'text-gray-500 bg-gray-500/10', 
      expired: false, 
      pendingDelete: false,
      isFeaturedActive,
      featuredUntil: ad.featuredUntil
    };
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Mi Cuenta</h1>
            <p className="text-muted-foreground">Gestiona tus avisos clasificados publicados</p>
          </div>
          <Link 
            href="/clasificados/publicar" 
            className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition-all shadow-lg"
          >
            <Plus size={20} className="mr-2" />
            Publicar Aviso
          </Link>
        </div>

        <div className="bg-surface glass rounded-2xl border border-border p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
            <Tag className="mr-2 text-primary" size={24} />
            Mis Clasificados
          </h2>

          {loading ? (
            <div className="text-center text-muted-foreground py-12">Cargando tus avisos...</div>
          ) : classifieds.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                <Tag className="text-gray-500" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Aún no tienes avisos</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">Empieza a vender, alquilar o promocionar tus servicios hoy mismo publicando tu primer clasificado.</p>
              <Link href="/clasificados/publicar" className="text-primary font-semibold hover:underline">
                Publicar mi primer aviso
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classifieds.map(ad => {
                const status = getStatus(ad);
                
                return (
                  <div key={ad.id} className={`bg-background border rounded-xl flex flex-col h-full transition-all duration-300 ${status.expired ? 'border-red-500/30 opacity-80' : 'border-border hover:border-primary/50 hover:shadow-lg'}`}>
                    <div className="relative h-40 bg-secondary rounded-t-xl overflow-hidden border-b border-border">
                       <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${ad.imageUrl})` }}
                      />
                      {status.isFeaturedActive && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black px-2 py-1 rounded shadow-lg flex items-center">
                          <Star className="w-3 h-3 mr-1 fill-white" /> DESTACADO
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg mb-1 truncate text-foreground">{ad.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{ad.category?.name || 'General'}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm font-medium">
                          <span className={`flex items-center px-2 py-1 rounded-full ${status.color}`}>
                            {status.expired ? <AlertTriangle size={14} className="mr-1" /> : <CheckCircle size={14} className="mr-1" />} 
                            {status.label}
                          </span>
                        </div>
                        
                        {status.isFeaturedActive && (
                          <div className="flex items-center text-sm">
                            <span className="flex items-center text-purple-600 dark:text-purple-400 font-medium">
                              <Star size={14} className="mr-1 fill-current" /> Expira: {new Date(status.featuredUntil).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-primary text-lg">
                            {ad.price ? `$${ad.price.toLocaleString('es-AR')}` : 'Consultar'}
                          </span>
                          <Link href={`/clasificados/${ad.slug}`} className="text-sm font-medium text-primary hover:underline">
                            Ver aviso
                          </Link>
                        </div>
                        
                        {/* ACCIONES */}
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                          <button 
                            onClick={() => handleRepublish(ad.id)}
                            disabled={actionLoading || (!status.expired && !ad.isFeatured)}
                            title="Republicar Aviso (1 Crédito)"
                            className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold transition-colors ${status.expired ? 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                          >
                            <RotateCw size={18} className="mb-1" />
                            Republicar
                          </button>
                          
                          <button 
                            onClick={() => handleHighlight(ad.id)}
                            disabled={actionLoading || status.isFeaturedActive || status.expired}
                            title="Destacar Aviso (1 Destacado)"
                            className="flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors disabled:opacity-50"
                          >
                            <Star size={18} className="mb-1" />
                            Destacar
                          </button>

                          <button 
                            onClick={() => handleDelete(ad.id)}
                            disabled={actionLoading}
                            title="Eliminar Aviso"
                            className="flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={18} className="mb-1" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
