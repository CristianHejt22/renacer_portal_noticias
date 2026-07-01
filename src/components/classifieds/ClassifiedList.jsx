'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Star, LayoutGrid, List as ListIcon, ExternalLink } from 'lucide-react';

export default function ClassifiedList({ classifieds }) {
  // Default to list view on mobile, but let user toggle
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  if (classifieds.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-2xl border border-border">
        <p className="text-gray-600 dark:text-gray-400 text-xl">No hay clasificados disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div>
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

      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          : "flex flex-col space-y-6"
      }>
        {classifieds.map((ad) => {
          const avgRating = ad.reviews?.length > 0 
            ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
            : 'Nuevo';

          if (viewMode === 'list') {
            return (
              <div 
                key={ad.id} 
                className="group flex flex-col md:flex-row bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="relative h-48 md:h-auto md:w-1/3 overflow-hidden bg-secondary shrink-0">
                  <div 
                    className="absolute inset-0 bg-cover md:bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${ad.imageUrl})` }}
                  />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {ad.title}
                    </h2>
                    {ad.price && (
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold whitespace-nowrap">
                        $ {ad.price.toLocaleString('es-AR')}
                      </span>
                    )}
                  </div>

                  {ad.category && (
                    <span className="text-xs text-primary mb-3 uppercase tracking-wider font-bold">
                      {ad.category.name}
                    </span>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base line-clamp-3 mb-4 flex-grow">
                    {ad.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto pt-4 border-t border-border">
                    <div className="flex items-center text-yellow-500 text-sm font-semibold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span>{avgRating}</span>
                      <span className="text-gray-600 dark:text-gray-500 font-normal ml-1">({ad.reviews?.length || 0})</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                      <a 
                        href={`/api/clasificados/click?id=${ad.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center text-sm font-semibold text-[#25D366] bg-[#25D366]/10 px-4 py-2 rounded-full hover:bg-[#25D366]/20 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contactar
                      </a>
                      <Link 
                        href={`/clasificados/${ad.slug}`}
                        className="flex-1 sm:flex-none flex items-center justify-center text-sm font-semibold text-white bg-primary px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                      >
                        Abrir para ver más
                        <ExternalLink className="w-4 h-4 ml-2" />
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
              className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative h-60 w-full overflow-hidden bg-secondary">
                <div 
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${ad.imageUrl})` }}
                />
                {ad.price && (
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-primary px-3 py-1 rounded-full font-bold">
                    $ {ad.price.toLocaleString('es-AR')}
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                  <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {ad.title}
                  </h2>
                </div>
                
                {ad.category && (
                  <span className="text-xs text-primary mb-2 uppercase tracking-wider font-bold">
                    {ad.category.name}
                  </span>
                )}

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                  {ad.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                  <div className="flex items-center text-yellow-500 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span>{avgRating}</span>
                    <span className="text-gray-600 dark:text-gray-500 font-normal ml-1">({ad.reviews?.length || 0})</span>
                  </div>
                  <button className="flex items-center text-sm font-semibold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-full hover:bg-[#25D366]/20 transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contactar
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
