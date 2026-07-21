'use client';

import { useState, useEffect } from 'react';
import { Plus, LogOut, CheckCircle, Clock, Trash2, RotateCw, Star, AlertTriangle, User, Edit3, Settings, LayoutDashboard, Tag, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getUserClassifieds, deleteClassified, republishClassified, highlightClassified } from '@/app/actions/classifieds';
import { getMe, logout, updateMyProfile } from '@/app/actions/auth';

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('avisos'); // 'avisos' | 'perfil'
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
    const res = await updateMyProfile(profileData);
    if (res.success) {
      toast.success('Perfil guardado con éxito');
    } else {
      toast.error(res.error || 'Error al guardar el perfil');
    }
    setSavingProfile(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este aviso permanentemente?')) return;
    setActionLoading(true);
    const res = await deleteClassified(id);
    if (res.success) {
      toast.success('Aviso eliminado');
      loadData();
    } else {
      toast.error(res.error || 'Error al eliminar');
    }
    setActionLoading(false);
  };

  const handleRepublish = async (id) => {
    if (!confirm('Republicar consumirá 1 Crédito Normal y reiniciará los 30 días de publicación. ¿Deseas continuar?')) return;
    setActionLoading(true);
    const res = await republishClassified(id);
    if (res.success) {
      toast.success('Aviso republicado con éxito');
      loadData();
    } else {
      toast.error(res.error || 'Error al republicar');
    }
    setActionLoading(false);
  };

  const handleHighlight = async (id) => {
    if (!confirm('Destacar este aviso consumirá 1 Crédito Destacado por 7 días. ¿Deseas continuar?')) return;
    setActionLoading(true);
    const res = await highlightClassified(id);
    if (res.success) {
      toast.success('Aviso destacado con éxito');
      loadData();
    } else {
      toast.error(res.error || 'Error al destacar');
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
      return { label: `Vencido (Borrable en ${37 - daysSinceCreation}d)`, color: 'text-yellow-500 bg-yellow-500/10', expired: true, pendingDelete: false };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <header className="border-b border-border bg-surface glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black text-primary tracking-tight">Mi Portal</Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors hidden sm:block">
              Ir a la Portada
            </Link>
            <button onClick={handleLogout} className="flex items-center space-x-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors">
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-surface glass border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
              <div className="text-center pb-6 border-b border-border mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <User size={32} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground truncate">{userProfile?.name}</h2>
                <p className="text-sm text-gray-500 truncate">{userProfile?.email}</p>
              </div>

              {/* Stats / Credits */}
              <div className="bg-background rounded-xl p-4 mb-6 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Créditos Normales</span>
                  <span className="font-bold text-foreground">{userProfile?.credits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Créditos Destacados</span>
                  <span className="font-bold text-yellow-500 flex items-center">
                    <Star size={12} className="mr-1 fill-current" />
                    {userProfile?.featuredCredits || 0}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('avisos')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'avisos' ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold' : 'text-gray-500 hover:bg-white/5 hover:text-foreground'}`}
                >
                  <LayoutDashboard size={18} />
                  <span>Mis Clasificados</span>
                </button>
                <button 
                  onClick={() => setActiveTab('perfil')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'perfil' ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold' : 'text-gray-500 hover:bg-white/5 hover:text-foreground'}`}
                >
                  <Settings size={18} />
                  <span>Datos del Perfil</span>
                </button>
              </nav>

              <div className="mt-8">
                <Link href="/clasificados/publicar" className="w-full flex items-center justify-center space-x-2 bg-foreground text-background hover:bg-gray-800 dark:hover:bg-gray-200 py-3 rounded-xl font-bold transition-colors">
                  <Plus size={18} />
                  <span>Publicar Aviso</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            
            {/* Tab: Mis Avisos */}
            {activeTab === 'avisos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-foreground">Mis Clasificados</h1>
                    <p className="text-gray-500 mt-1">Gestiona tus anuncios, republica o destaca para vender más rápido.</p>
                  </div>
                </div>

                {classifieds.length === 0 ? (
                  <div className="bg-surface border border-dashed border-border rounded-2xl p-12 text-center">
                    <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                      <Tag size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">No tienes avisos publicados</h3>
                    <p className="text-gray-500 mb-6">Publica tu primer anuncio y llega a miles de compradores.</p>
                    <Link href="/clasificados/publicar" className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-colors">
                      <Plus size={18} />
                      <span>Publicar ahora</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {classifieds.map(ad => {
                      const status = getStatus(ad);
                      return (
                        <div key={ad.id} className="bg-surface glass border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          {/* Banner Destacado */}
                          {status.isFeaturedActive && (
                            <div className="absolute top-4 right-[-35px] bg-yellow-500 text-white text-[10px] font-bold py-1 px-10 transform rotate-45 shadow-sm">
                              DESTACADO
                            </div>
                          )}

                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Image */}
                            <div className="w-full md:w-48 h-32 md:h-full flex-shrink-0 bg-background rounded-xl overflow-hidden border border-border">
                              {ad.imageUrl ? (
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                  <ImageIcon size={32} className="mb-2 opacity-50" />
                                  <span className="text-xs font-medium">Sin imagen</span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-2 pr-4">
                                <Link href={`/clasificados/${ad.slug}`} className="text-xl font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                                  {ad.title}
                                </Link>
                              </div>
                              
                              {ad.price && (
                                <div className="text-lg font-bold text-foreground mb-3">
                                  $ {ad.price.toLocaleString('es-AR')}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 mb-4 mt-auto">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.color}`}>
                                  {status.label}
                                </span>
                                <span className="flex items-center text-xs text-gray-500 font-medium">
                                  <Clock size={12} className="mr-1" />
                                  {new Date(ad.createdAt).toLocaleDateString()}
                                </span>
                                {ad.category && (
                                  <span className="flex items-center text-xs text-gray-500 font-medium">
                                    <Tag size={12} className="mr-1" />
                                    {ad.category.name}
                                  </span>
                                )}
                              </div>

                              {/* Acciones */}
                              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                                {!status.pendingDelete && (
                                  <Link 
                                    href={`/clasificados/editar/${ad.id}`}
                                    className="flex items-center space-x-1 px-3 py-2 bg-background hover:bg-gray-100 dark:hover:bg-white/5 border border-border rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Edit3 size={14} />
                                    <span>Editar</span>
                                  </Link>
                                )}
                                
                                {status.expired && !status.pendingDelete && (
                                  <button 
                                    onClick={() => handleRepublish(ad.id)}
                                    disabled={actionLoading}
                                    className="flex items-center space-x-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <RotateCw size={14} />
                                    <span>Republicar</span>
                                  </button>
                                )}

                                {!status.isFeaturedActive && !status.expired && (
                                  <button 
                                    onClick={() => handleHighlight(ad.id)}
                                    disabled={actionLoading}
                                    className="flex items-center space-x-1 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 rounded-lg text-sm font-medium transition-colors"
                                  >
                                    <Star size={14} />
                                    <span>Destacar</span>
                                  </button>
                                )}

                                <button 
                                  onClick={() => handleDelete(ad.id)}
                                  disabled={actionLoading}
                                  className="flex items-center space-x-1 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 rounded-lg text-sm font-medium ml-auto transition-colors"
                                >
                                  <Trash2 size={14} />
                                  <span>Eliminar</span>
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
            )}

            {/* Tab: Perfil */}
            {activeTab === 'perfil' && (
              <div className="space-y-6 max-w-2xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-foreground">Datos del Perfil</h1>
                  <p className="text-gray-500 mt-1">Configura tu información de contacto predeterminada para publicar más rápido.</p>
                </div>

                <div className="bg-surface glass border border-border p-8 rounded-2xl shadow-sm">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp</label>
                      <input 
                        type="text" 
                        value={profileData.whatsapp}
                        onChange={e => setProfileData({...profileData, whatsapp: e.target.value})}
                        placeholder="Ej: +5491112345678"
                        className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <AlertTriangle size={12} className="mr-1" />
                        Se autocompletará al crear nuevos avisos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Provincia</label>
                        <input 
                          type="text" 
                          value={profileData.province}
                          onChange={e => setProfileData({...profileData, province: e.target.value})}
                          placeholder="Ej: Santa Fe"
                          className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ciudad</label>
                        <input 
                          type="text" 
                          value={profileData.city}
                          onChange={e => setProfileData({...profileData, city: e.target.value})}
                          placeholder="Ej: Rosario"
                          className="w-full bg-background border border-border rounded-xl p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                        />
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-border">
                      <button 
                        type="submit" 
                        disabled={savingProfile}
                        className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
