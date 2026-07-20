'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Star, LayoutGrid, List as ListIcon, ExternalLink, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import BannerDisplay from '@/components/ads/BannerDisplay';

export default function ClassifiedList({ classifieds, categories = [], pagination, currentQuery = '', currentCategory = null }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState(currentQuery);
  const [showFilters, setShowFilters] = useState(false); // For mobile toggle

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== currentQuery) {
        updateUrl(searchTerm, currentCategory, 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, currentCategory]);

  const updateUrl = (q, cat, page) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('cat', cat);
    if (page > 1) params.set('page', page);
    router.push(`/clasificados?${params.toString()}`);
  };

  const handleCategoryClick = (catId) => {
    const newCat = currentCategory == catId ? null : catId;
    updateUrl(searchTerm, newCat, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateUrl(searchTerm, currentCategory, newPage);
  };

  const featuredAds = classifieds.filter(ad => ad.isFeatured);
  const normalAds = classifieds.filter(ad => !ad.isFeatured);

  const renderAdCard = (ad, index) => {
    const avgRating = ad.reviews?.length > 0 
      ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
      : 'Nuevo';
    
    const isInjectAd = (index > 0 && index % 6 === 0);

    let cardContent = null;
    if (viewMode === 'list') {
      cardContent = (
        <Link 
          href={`/clasificados/${ad.slug}`}
          key={ad.id} 
          className="group flex flex-col sm:flex-row bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="relative h-48 sm:h-auto sm:w-1/3 bg-gray-100 dark:bg-black/20 flex items-center justify-center shrink-0 p-2">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${ad.imageUrl})` }}
            />
            {ad.isFeatured && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm flex items-center z-10">
                <Star className="w-3 h-3 mr-1 fill-white" /> DESTACADO
              </div>
            )}
          </div>
            
          <div className="p-4 sm:p-6 flex flex-col flex-grow relative">
            <div className="flex justify-between items-start mb-1">
              <h2 className="text-xl sm:text-2xl font-normal text-gray-900 dark:text-gray-100 line-clamp-2">
                {ad.title}
              </h2>
            </div>

            {ad.price && (
              <div className="text-2xl sm:text-3xl font-normal text-gray-900 dark:text-gray-100 mb-2">
                $ {ad.price.toLocaleString('es-AR')}
              </div>
            )}

            {ad.category && (
              <span className="text-xs text-primary mb-3 uppercase tracking-wider font-semibold">
                {ad.category.name}
              </span>
            )}

            <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
              {ad.description}
            </p>
            
            <div className="flex items-center space-x-4 mt-auto pt-4 border-t border-gray-100 dark:border-border">
              <div className="flex items-center text-yellow-500 text-sm font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{avgRating}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                {ad.clicks}
              </div>
            </div>
          </div>
        </Link>
      );
    } else {
      // Grid View - MercadoLibre style
      cardContent = (
        <Link 
          href={`/clasificados/${ad.slug}`} 
          key={ad.id} 
          className="group flex flex-col bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          <div className="relative h-48 w-full bg-gray-100 dark:bg-black/20 flex items-center justify-center p-2 border-b border-gray-100 dark:border-border">
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url(${ad.imageUrl})` }}
            />
            {ad.isFeatured && (
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm flex items-center z-10">
                <Star className="w-3 h-3 mr-1 fill-white" /> DESTACADO
              </div>
            )}
          </div>
          
          <div className="p-4 flex flex-col flex-grow">
            {ad.price && (
              <div className="text-2xl font-normal text-gray-900 dark:text-gray-100 mb-1">
                $ {ad.price.toLocaleString('es-AR')}
              </div>
            )}
            
            <h2 className="text-sm font-light text-gray-600 dark:text-gray-300 line-clamp-2 leading-tight mb-2 group-hover:text-primary transition-colors">
              {ad.title}
            </h2>
            
            {ad.category && (
              <span className="text-[10px] text-primary uppercase tracking-wider font-semibold mb-2">
                {ad.category.name}
              </span>
            )}
            
            <div className="mt-auto pt-3 flex items-center space-x-3">
              <div className="flex items-center text-yellow-500 text-xs font-bold">
                <Star className="w-3 h-3 fill-current mr-1" />
                <span>{avgRating}</span>
              </div>
              <div className="text-gray-400 text-xs flex items-center">
                Vistas: {ad.clicks}
              </div>
            </div>
          </div>
        </Link>
      );
    }

    return (
      <div key={ad.id} className="contents">
        {isInjectAd && (
          <div className="group flex flex-col bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl overflow-hidden justify-center items-center relative">
            <BannerDisplay position="plan-clasificados" mode="slider" className="m-0 p-2 sm:p-4 w-full h-full flex items-center justify-center [&>a]:border-none [&>a]:rounded-xl" hideUI={true} />
            <span className="absolute top-2 left-2 bg-gray-500/10 text-gray-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest z-10">Publicidad</span>
          </div>
        )}
        {cardContent}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* Sidebar de Filtros (Izquierda) */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="md:sticky md:top-24 space-y-6">
          
          {/* Botón Filtros Mobile */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden w-full flex items-center justify-between bg-white dark:bg-surface border border-gray-200 dark:border-border p-4 rounded-xl font-bold"
          >
            <span className="flex items-center"><Filter className="w-5 h-5 mr-2"/> Filtros y Búsqueda</span>
            <span>{showFilters ? '-' : '+'}</span>
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} md:block space-y-6 bg-white dark:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none border md:border-none border-gray-200 dark:border-border`}>
            
            {/* Buscador */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Buscar</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej: Bicicleta, Casa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg pl-10 pr-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Categorías */}
            {categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Categorías</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        !currentCategory 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                    >
                      Todas las categorías
                    </button>
                  </li>
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentCategory == cat.id 
                            ? 'bg-primary/10 text-primary font-bold' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido Principal (Derecha) */}
      <main className="flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-200 dark:border-border pb-4">
          <div>
            <h1 className="text-2xl font-bold">
              {currentCategory 
                ? categories.find(c => c.id == currentCategory)?.name || 'Clasificados'
                : 'Todos los Clasificados'
              }
            </h1>
            <p className="text-sm text-gray-500 mt-1">{classifieds.length} resultados encontrados</p>
          </div>
          
          <div className="flex bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-lg p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${
                viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-foreground'
              }`}
              title="Vista de Cuadros"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center transition-colors ${
                viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-foreground'
              }`}
              title="Vista de Lista"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {classifieds.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-surface rounded-xl border border-gray-200 dark:border-border shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-black/20 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <Search size={32} />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">No encontramos publicaciones que coincidan con tu búsqueda.</p>
            <button onClick={() => updateUrl('', null, 1)} className="mt-4 text-primary font-bold hover:underline">
              Ver todos los clasificados
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-10">
              {featuredAds.length > 0 && (
                <section>
                  <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800 dark:text-gray-200">
                    <Star className="text-purple-500 w-5 h-5 mr-2 fill-purple-500" />
                    Destacados
                  </h2>
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-4"}>
                    {featuredAds.map((ad, i) => renderAdCard(ad, i))}
                  </div>
                </section>
              )}

              {normalAds.length > 0 && (
                <section>
                  {featuredAds.length > 0 && (
                    <h2 className="text-lg font-bold mb-4 mt-8 text-gray-800 dark:text-gray-200">
                      Más publicaciones
                    </h2>
                  )}
                  <div className={viewMode === 'grid' ? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "flex flex-col space-y-4"}>
                    {normalAds.map((ad, i) => renderAdCard(ad, i + featuredAds.length))}
                  </div>
                </section>
              )}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 mb-8 gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-full border border-gray-200 dark:border-border bg-white dark:bg-surface hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-medium text-gray-500 px-4">
                  {pagination.page} de {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-full border border-gray-200 dark:border-border bg-white dark:bg-surface hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
