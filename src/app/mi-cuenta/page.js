'use client';

import { useState, useEffect } from 'react';
import { Plus, Tag, LogOut, CheckCircle, Clock, Trash2, RotateCw, Star, AlertTriangle, User, Mail, Calendar, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserClassifieds, deleteClassified, republishClassified, highlightClassified } from '@/app/actions/classifieds';
import { getMe, logout } from '@/app/actions/auth';

export default function UserDashboard() {
  const router = useRouter();
  const [classifieds, setClassifieds] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [profileData, setProfileData] = useState({ whatsapp: '', province: '', city: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [adsRes, profileRes] = await Promise.all([
      getUserClassifieds(),
      getMe()
    ]);
    
    if (adsRes.success) setClassifieds(adsRes.data);
    if (profileRes.success) {
      setUserProfile(profileRes.data);
      setProfileData({
        whatsapp: profileRes.data.whatsapp || '',
        province: profileRes.data.province || '',
        city: profileRes.data.city || ''
      });
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const { updateMyProfile } = await import('@/app/actions/auth');
    const res = await updateMyProfile(profileData);
    if (res.success) {
      alert('Perfil guardado con éxito');
    } else {
      alert(res.error || 'Error al guardar el perfil');
    }
    setSavingProfile(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este aviso permanentemente?')) return;
    setActionLoading(true);
    const res = await deleteClassified(id);
    if (res.success) {
      alert('Aviso eliminado');
      loadData();
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
      loadData();
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
      loadData();
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
            <p className="text-muted-foreground">Gestiona tu perfil y tus avisos publicados</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href="/paquetes" 
              className="bg-surface border border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition-all"
            >
              Comprar Créditos
            </Link>
            <Link 
              href="/clasificados/publicar" 
              className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-lg font-semibold flex items-center transition-all shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              Publicar Aviso
            </Link>
          </div>
        </div>

        {/* User Profile Cards */}
        {userProfile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface glass rounded-2xl border border-border p-6 flex flex-col justify-center">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <User size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{userProfile.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Mail size={14} className="mr-1" /> {userProfile.email}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex items-center mt-2">
                <Calendar size={14} className="mr-1" />
                Registrado el {new Date(userProfile.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-surface glass rounded-2xl border border-border p-6 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Package size={100} />
              </div>
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Créditos Normales</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-black text-foreground mr-2">{userProfile.credits}</span>
                <span className="text-sm font-medium text-muted-foreground">disponibles</span>
              </div>
              
              {userProfile.freeCreditsExpireAt && new Date(userProfile.freeCreditsExpireAt) > new Date() && (
                <div className="mt-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-semibold px-3 py-2 rounded-lg flex items-start">
                  <AlertTriangle size={14} className="mr-2 shrink-0 mt-0.5" />
                  <span>Tienes créditos de bienvenida que expiran el {new Date(userProfile.freeCreditsExpireAt).toLocaleDateString()}.</span>
                </div>
              )}
            </div>

            <div className="bg-surface glass rounded-2xl border border-purple-500/30 p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={100} className="text-purple-500" />
              </div>
              <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Créditos Destacados</h4>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-black text-foreground mr-2">{userProfile.featuredCredits}</span>
                <span className="text-sm font-medium text-muted-foreground">disponibles</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Usa estos créditos para multiplicar x10 la visibilidad de tus avisos por 7 días.
              </p>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {userProfile && (
          <div className="bg-surface glass rounded-2xl border border-border p-6 shadow-xl mb-8">
            <h2 className="text-xl font-bold mb-6 flex items-center text-foreground">
              <User className="mr-2 text-primary" size={24} />
              Datos del Perfil
            </h2>
            <form onSubmit={handleSaveProfile} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">WhatsApp</label>
                <input
                  type="text"
                  value={profileData.whatsapp}
                  onChange={(e) => setProfileData({...profileData, whatsapp: e.target.value})}
                  placeholder="Ej: 549351000000"
                  className="w-full border rounded-lg px-4 py-2 bg-background focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Provincia y Ciudad</label>
                <input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  placeholder="Ej: Rosario, Santa Fe"
                  className="w-full border rounded-lg px-4 py-2 bg-background focus:border-primary outline-none"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">Estos datos se completarán automáticamente cuando vayas a publicar un nuevo aviso.</p>
          </div>
        )}

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
