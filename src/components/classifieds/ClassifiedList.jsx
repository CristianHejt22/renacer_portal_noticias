'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageCircle, Star, LayoutGrid, List as ListIcon, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import BannerDisplay from '@/components/ads/BannerDisplay';

export default function ClassifiedList({ classifieds, categories = [], pagination, currentQuery = '', currentCategory = null }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState(currentQuery);

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

  return (
    <div>
      {/* Search and Categories */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-full pl-12 pr-4 py-3 text-foreground focus:border-primary focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-5 py-2.5 rounded-full text-base font-bold transition-all shadow-sm hover:shadow-md ${
                !currentCategory 
                  ? 'bg-primary text-white scale-105' 
                  : 'bg-surface border border-border text-foreground hover:bg-muted'
              }`}
            >
              Todos
            </button>
            {categories.slice(0, 6).map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-5 py-2.5 rounded-full text-base font-bold transition-all shadow-sm hover:shadow-md ${
                  currentCategory == cat.id 
                    ? 'bg-primary text-white scale-105' 
                    : 'bg-surface border border-border text-foreground hover:bg-muted'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md flex items-center transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
            title="Vista de Lista"
          >
            <ListIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md flex items-center transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:text-foreground'
            }`}
            title="Vista de Cuadros"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {classifieds.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border shadow-sm">
          <p className="text-gray-600 dark:text-gray-400 text-xl">No se encontraron clasificados.</p>
          <button onClick={() => updateUrl('', null, 1)} className="mt-4 text-primary hover:underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              : "flex flex-col space-y-6"
          }>
            {classifieds.map((ad, index) => {
              const avgRating = ad.reviews?.length > 0 
                ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
                : 'Nuevo';
              
              const isInjectAd = (index > 0 && index % 6 === 0);

              const renderAdCard = () => {
                if (viewMode === 'list') {
                  return (
                    <div 
                    key={ad.id} 
                    className={`group flex flex-col md:flex-row bg-surface border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${ad.isFeatured ? 'border-purple-500 hover:shadow-purple-500/20' : 'border-border hover:border-primary/50 hover:shadow-primary/20'}`}
                  >
                    <div className="relative h-64 md:h-auto md:w-1/3 overflow-hidden bg-secondary/30 shrink-0">
                      <div 
                        className="absolute inset-0 bg-cover md:bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${ad.imageUrl})` }}
                      />
                      {ad.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center">
                          <Star className="w-4 h-4 mr-1.5 fill-white" /> DESTACADO
                          </div>
                        )}
                      </div>
                      
                    <div className="p-6 md:p-8 flex flex-col flex-grow relative">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h2 className={`text-2xl md:text-3xl font-bold transition-colors line-clamp-2 leading-tight ${ad.isFeatured ? 'text-purple-600 dark:text-purple-400' : 'text-foreground group-hover:text-primary'}`}>
                          {ad.title}
                        </h2>
                        {ad.price && (
                          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full font-black text-lg whitespace-nowrap shadow-sm">
                            $ {ad.price.toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>

                      {ad.category && (
                        <span className="text-sm text-primary mb-3 uppercase tracking-widest font-black">
                          {ad.category.name}
                        </span>
                      )}

                      <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg line-clamp-3 mb-6 flex-grow">
                        {ad.description}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-6 border-t border-border/50">
                        <div className="flex items-center text-yellow-500 text-base font-bold">
                          <Star className="w-5 h-5 fill-current mr-1" />
                          <span>{avgRating}</span>
                          <span className="text-gray-600 dark:text-gray-500 font-medium ml-1.5">({ad.reviews?.length || 0})</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <a 
                            href={`https://wa.me/${ad.whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center text-sm md:text-base font-bold text-[#25D366] bg-[#25D366]/10 px-5 py-2.5 rounded-full hover:bg-[#25D366]/20 transition-all active:scale-95"
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Contactar
                          </a>
                          <Link 
                            href={`/clasificados/${ad.slug}`}
                            className={`flex-1 sm:flex-none flex items-center justify-center text-sm md:text-base font-bold text-white px-5 py-2.5 rounded-full transition-all active:scale-95 shadow-sm hover:shadow-md ${ad.isFeatured ? 'bg-purple-600 hover:bg-purple-700' : 'bg-primary hover:bg-primary/90'}`}
                          >
                            Ver más
                            <ExternalLink className="w-5 h-5 ml-2" />
                          </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Grid View
                return (
                  <Link 
                    href={`/clasificados/${ad.slug}`} 
                    key={ad.id} 
                    className={`group flex flex-col bg-surface border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${ad.isFeatured ? 'border-purple-500 hover:shadow-purple-500/20' : 'border-border hover:border-primary/50 hover:shadow-primary/20'}`}
                  >
                    <div className="relative h-64 w-full overflow-hidden bg-secondary/30">
                      <div 
                        className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${ad.imageUrl})` }}
                      />
                      {ad.isFeatured && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs md:text-sm font-black px-4 py-1.5 rounded-full shadow-lg flex items-center">
                          <Star className="w-4 h-4 mr-1.5 fill-white" /> DESTACADO
                        </div>
                      )}
                      {ad.price && (
                        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-lg font-black shadow-lg">
                          $ {ad.price.toLocaleString('es-AR')}
                        </div>
                      )}
                    </div>
                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className={`text-2xl font-bold transition-colors line-clamp-2 leading-tight ${ad.isFeatured ? 'text-purple-600 dark:text-purple-400' : 'text-foreground group-hover:text-primary'}`}>
                          {ad.title}
                        </h2>
                      </div>
                      
                      {ad.category && (
                        <span className="text-sm text-primary mb-3 uppercase tracking-widest font-black">
                          {ad.category.name}
                        </span>
                      )}

                      <p className="text-gray-600 dark:text-gray-400 text-base line-clamp-3 mb-8 flex-grow">
                        {ad.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                        <div className="flex items-center text-yellow-500 text-base font-bold">
                          <Star className="w-5 h-5 fill-current mr-1" />
                          <span>{avgRating}</span>
                          <span className="text-gray-600 dark:text-gray-500 font-medium ml-1.5">({ad.reviews?.length || 0})</span>
                        </div>
                        <button className="flex items-center text-sm md:text-base font-bold text-[#25D366] bg-[#25D366]/10 px-4 py-2 rounded-full hover:bg-[#25D366]/20 transition-all active:scale-95">
                          <MessageCircle className="w-5 h-5 mr-2" />
                          Contactar
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              };

              return (
                <div key={ad.id} className="contents">
                  {isInjectAd && (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 w-full my-4">
                      <BannerDisplay position="in-article" mode="slider" />
                    </div>
                  )}
                  {renderAdCard()}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-full border border-border bg-surface text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <span className="text-sm font-medium text-muted-foreground px-4">
                Página {pagination.page} de {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-full border border-border bg-surface text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
