import { getClassifiedBySlug } from '@/app/actions/classifieds';
import { notFound } from 'next/navigation';
import { Star, MessageCircle, Clock, ExternalLink, Tag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ClassifiedReviewForm from '@/components/classifieds/ClassifiedReviewForm';
import ClassifiedGallery from '@/components/classifieds/ClassifiedGallery';
import SocialShareButtons from '@/components/shared/SocialShareButtons';
import AdViewTracker from '@/components/classifieds/AdViewTracker';

export const revalidate = 60; // ISR

export default async function ClassifiedDetailPage({ params }) {
  const { slug } = await params;
  const res = await getClassifiedBySlug(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const ad = res.data;
  const avgRating = ad.reviews.length > 0 
    ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
    : 'Nuevo';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <AdViewTracker adId={ad.id} />
      
      {/* Breadcrumb / Top Info */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/clasificados" className="hover:text-primary transition-colors">Clasificados</Link>
        <span className="mx-2">/</span>
        {ad.category && (
          <>
            <span className="text-gray-900 dark:text-gray-300 font-medium">{ad.category.name}</span>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-400 truncate">{ad.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Izquierda: Imagen y Descripción (Ocupa 8 columnas en Desktop) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Galería de Imágenes */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
            <ClassifiedGallery mainImage={ad.imageUrl} images={ad.images} />
          </div>

          {/* Descripción */}
          <div className="bg-surface border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-foreground mb-6 pb-4 border-b border-border">Descripción</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                {ad.description}
              </p>
            </div>
          </div>
        </div>

        {/* Derecha: Sidebar (Ocupa 4 columnas en Desktop) */}
        <div className="lg:col-span-4">
          <div className="bg-surface border border-border rounded-2xl p-6 lg:p-8 shadow-lg sticky top-24">
            
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
              <span className="text-xs uppercase tracking-widest font-semibold bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-1 rounded">
                Nuevo
              </span>
              <span>•</span>
              <div className="flex items-center text-yellow-500 font-bold">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span>{avgRating}</span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight">{ad.title}</h1>
            
            {ad.price && (
              <div className="text-4xl font-light text-foreground mb-6">
                $ {ad.price.toLocaleString('es-AR')}
              </div>
            )}

            {ad.city && (
              <div className="flex items-center text-gray-500 dark:text-gray-400 mb-6 font-medium text-sm">
                <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {ad.city}
              </div>
            )}

            <div className="space-y-4 mb-8">
              <a 
                href={`/api/clasificados/click?id=${ad.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 bg-[#00a650] hover:bg-[#008f45] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-green-500/20"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Contactar Vendedor</span>
              </a>
              <p className="text-center text-gray-400 text-xs">
                Al contactar, menciona que lo viste en el Portal.
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Clock className="w-4 h-4 mr-2" />
                <span>Publicado {new Date(ad.createdAt).toLocaleDateString()}</span>
              </div>
              <SocialShareButtons title={ad.title} slug={`/clasificados/${ad.slug}`} />
            </div>

          </div>
        </div>
      </div>

      {/* Sección de Reseñas */}
      <div className="mt-20 pt-10 border-t border-border">
        <h2 className="text-3xl font-bold mb-10">Reseñas de Usuarios</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Formulario */}
          <div className="lg:col-span-4">
            <ClassifiedReviewForm classifiedAdId={ad.id} />
          </div>

          {/* Lista de Reseñas */}
          <div className="lg:col-span-8 space-y-6">
            {ad.reviews.length > 0 ? (
              ad.reviews.map(review => (
                <div key={review.id} className="bg-surface border border-border p-6 rounded-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-foreground">{review.authorName}</h4>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{review.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-surface rounded-xl border border-border">
                <p className="text-gray-600 dark:text-gray-400">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
