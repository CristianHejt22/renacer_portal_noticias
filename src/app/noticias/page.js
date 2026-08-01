import Link from 'next/link';
import React from 'react';
import { getPublicPosts } from '@/app/actions/posts';
import BannerDisplay from '@/components/ads/BannerDisplay';
import FeaturedClassifieds from '@/components/classifieds/FeaturedClassifieds';
import { Newspaper, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CATEGORIES = [
  { name: 'Todas', slug: '' },
  { name: 'Política', slug: 'politica' },
  { name: 'Economía', slug: 'economia' },
  { name: 'Deportes', slug: 'deportes' },
  { name: 'Sociedad', slug: 'sociedad' },
  { name: 'Espectáculos', slug: 'espectaculos' },
  { name: 'Mundo', slug: 'mundo' },
];

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default async function NoticiasPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawCategorySlug = (resolvedSearchParams?.category || '').trim();
  const currentCategorySlug = normalizeText(rawCategorySlug);

  const res = await getPublicPosts({ limit: 100 });
  const allPosts = res.data || [];

  let posts = allPosts;
  let activeCategoryName = 'Todas las Noticias';

  if (currentCategorySlug) {
    posts = allPosts.filter(p => {
      if (!p.category) return false;
      return normalizeText(p.category) === currentCategorySlug;
    });

    const foundCategory = CATEGORIES.find(c => c.slug === currentCategorySlug);
    if (foundCategory) {
      activeCategoryName = foundCategory.name;
    } else if (posts.length > 0) {
      activeCategoryName = posts[0].category;
    } else {
      activeCategoryName = rawCategorySlug.charAt(0).toUpperCase() + rawCategorySlug.slice(1);
    }
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Determine banner plan
  let headerPlan = null;
  let gridPlan = 'plan-cielo-total';

  if (currentCategorySlug === 'nacional') {
    gridPlan = 'plan-nacional';
  } else if (currentCategorySlug === 'local') {
    gridPlan = 'plan-local';
  } else if (currentCategorySlug === 'deportes') {
    headerPlan = 'plan-deportivo';
    gridPlan = 'plan-cielo-total';
  } else if (['mundo', 'internacional', 'tendencias'].includes(currentCategorySlug)) {
    headerPlan = 'plan-internacional';
    gridPlan = 'plan-cielo-total';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Newspaper size={14} />
          <span>Portal Informativo</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 capitalize">
          {activeCategoryName}
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Explora las últimas noticias, coberturas especiales y actualizaciones minuto a minuto.
        </p>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = (currentCategorySlug === '' && cat.slug === '') || (currentCategorySlug === cat.slug);
          const href = cat.slug ? `/noticias?category=${cat.slug}` : '/noticias';
          
          return (
            <Link
              key={cat.slug || 'todas'}
              href={href}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                  : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Header Banner */}
      {headerPlan && (
        <div className="mb-10">
          <BannerDisplay position={headerPlan} />
        </div>
      )}

      {/* News Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {posts.map((post, index) => {
            const cleanExcerpt = post.excerpt || post.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

            const postCard = (
              <Link 
                href={`/noticias/${post.slug}`} 
                key={post.id} 
                className="group cursor-pointer block bg-slate-900/70 border border-slate-800/80 hover:border-primary/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col backdrop-blur-sm"
              >
                <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-950">
                  <img 
                    src={post.coverImage || '/placeholder.jpg'}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  
                  {post.category && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-primary rounded-full font-semibold text-xs uppercase tracking-wider">
                      {post.category}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                      {cleanExcerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>{post.author?.name || 'Redacción'}</span>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
              </Link>
            );

            let showCieloTotal = gridPlan === 'plan-cielo-total' && (index + 1) % 6 === 0;
            let showOtherPlans = gridPlan !== 'plan-cielo-total' && gridPlan !== null && (index + 1) % 3 === 0;

            if (showCieloTotal || showOtherPlans) {
              return (
                <React.Fragment key={`group-${index}`}>
                  {postCard}
                  {(gridPlan === 'plan-nacional' || showCieloTotal) && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                      <BannerDisplay position={gridPlan} />
                    </div>
                  )}
                  {gridPlan === 'plan-local' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4 flex justify-center">
                      <div className="max-w-md w-full">
                        <BannerDisplay position="plan-local" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return postCard;
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Newspaper size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay noticias en esta sección</h3>
          <p className="text-sm text-gray-400 mb-6">
            Actualmente no hay artículos publicados para la categoría seleccionada.
          </p>
          <Link 
            href="/noticias"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            <Sparkles size={16} />
            <span>Ver todas las noticias</span>
          </Link>
        </div>
      )}

      {/* Featured Classifieds at the bottom */}
      <div className="mt-20">
        <FeaturedClassifieds />
      </div>
    </div>
  );
}
