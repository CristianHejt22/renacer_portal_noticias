import Link from 'next/link';
import React from 'react';
import { getPublicPosts } from '@/app/actions/posts';
import { getCategories } from '@/app/actions/categories';
import BannerDisplay from '@/components/ads/BannerDisplay';
import FeaturedClassifieds from '@/components/classifieds/FeaturedClassifieds';
import { Newspaper, Sparkles, FolderOpen, Calendar, User, Images } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_CATEGORIES = [
  { name: 'Política', slug: 'politica' },
  { name: 'Economía', slug: 'economia' },
  { name: 'Deportes', slug: 'deportes' },
  { name: 'Sociedad', slug: 'sociedad' },
  { name: 'Espectáculos', slug: 'espectaculos' },
  { name: 'Mundo', slug: 'mundo' },
  { name: 'Policiales', slug: 'policiales' },
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

/**
 * Returns the sequence of interleaved banner plans for a given category.
 */
function getInterleavedBannerPlans(categorySlug) {
  if (categorySlug === 'deportes') {
    return ['plan-deportivo', 'plan-cielo-total', 'plan-deportivo', 'plan-nacional', 'plan-cielo-total'];
  }
  if (['nacional', 'politica', 'economia'].includes(categorySlug)) {
    return ['plan-nacional', 'plan-cielo-total', 'plan-local', 'plan-nacional', 'plan-deportivo'];
  }
  if (['local', 'sociedad', 'policiales'].includes(categorySlug)) {
    return ['plan-local', 'plan-cielo-total', 'plan-nacional', 'plan-local', 'plan-deportivo'];
  }
  if (['mundo', 'internacional', 'espectaculos', 'tendencias'].includes(categorySlug)) {
    return ['plan-internacional', 'plan-cielo-total', 'plan-nacional', 'plan-internacional', 'plan-deportivo'];
  }
  
  // General / Todas rotation across all advertising plans
  return [
    'plan-nacional',
    'plan-deportivo',
    'plan-local',
    'plan-internacional',
    'plan-cielo-total',
    'plan-clasificados',
  ];
}

export default async function NoticiasPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const rawCategorySlug = (resolvedSearchParams?.category || '').trim();
  const currentCategorySlug = normalizeText(rawCategorySlug);

  // Fetch published posts and categories concurrently
  const [postsRes, categoriesRes] = await Promise.all([
    getPublicPosts({ limit: 100 }),
    getCategories()
  ]);

  const allPosts = postsRes.data || [];
  const dbCategories = (categoriesRes.success && categoriesRes.data) ? categoriesRes.data : [];

  // Build category list dynamically from DB + Defaults + Existing Posts
  const categoryMap = new Map();
  categoryMap.set('', { name: 'Todas', slug: '' });

  // 1. Add DB categories
  dbCategories.filter(c => c.isActive).forEach(c => {
    const slug = normalizeText(c.slug || c.name);
    if (slug) categoryMap.set(slug, { name: c.name, slug });
  });

  // 2. Add defaults if not present
  DEFAULT_CATEGORIES.forEach(c => {
    if (!categoryMap.has(c.slug)) {
      categoryMap.set(c.slug, c);
    }
  });

  // 3. Add any category found in posts
  allPosts.forEach(p => {
    if (p.category) {
      const slug = normalizeText(p.category);
      if (slug && !categoryMap.has(slug)) {
        categoryMap.set(slug, { name: p.category, slug });
      }
    }
  });

  const availableCategories = Array.from(categoryMap.values());

  // Filter posts by category
  let posts = allPosts;
  let activeCategoryName = 'Todas las Noticias';

  if (currentCategorySlug) {
    posts = allPosts.filter(p => {
      if (!p.category) return false;
      return normalizeText(p.category) === currentCategorySlug;
    });

    const foundCategory = categoryMap.get(currentCategorySlug);
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

  // Header Banner Plan based on category
  let headerPlan = null;
  if (currentCategorySlug === 'deportes') {
    headerPlan = 'plan-deportivo';
  } else if (['nacional', 'politica', 'economia'].includes(currentCategorySlug)) {
    headerPlan = 'plan-nacional';
  } else if (['local', 'sociedad', 'policiales'].includes(currentCategorySlug)) {
    headerPlan = 'plan-local';
  } else if (['mundo', 'internacional', 'espectaculos', 'tendencias'].includes(currentCategorySlug)) {
    headerPlan = 'plan-internacional';
  }

  // Interleaved banner plans sequence
  const bannerSequence = getInterleavedBannerPlans(currentCategorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header & Title */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
          <Newspaper size={15} />
          <span>Portal Informativo Público</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3 capitalize">
          {activeCategoryName}
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Explora todas las noticias y coberturas especiales de libre acceso para toda la comunidad.
        </p>
      </div>

      {/* Category Navigation Bar */}
      <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
        {availableCategories.map((cat) => {
          const isActive = (currentCategorySlug === '' && cat.slug === '') || (currentCategorySlug === cat.slug);
          const href = cat.slug ? `/noticias?category=${cat.slug}` : '/noticias';
          
          return (
            <Link
              key={cat.slug || 'todas'}
              href={href}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
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
        <div className="mb-10 w-full flex justify-center">
          <BannerDisplay position={headerPlan} mode="slider" />
        </div>
      )}

      {/* News Grid with Interleaved Advertising Plans */}
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
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-gray-400" />
                      {post.author?.name || 'Redacción'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-gray-400" />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );

            // Interleave advertising plan every 3 posts (e.g. after post 3, 6, 9, 12, etc.)
            const isInterleavePoint = (index + 1) % 3 === 0;
            const interleaveIndex = Math.floor((index + 1) / 3) - 1;
            const currentPlan = bannerSequence[interleaveIndex % bannerSequence.length];

            if (isInterleavePoint) {
              return (
                <React.Fragment key={`group-${post.id}-${index}`}>
                  {postCard}
                  <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4 sm:my-6 w-full flex justify-center">
                    <div className="w-full">
                      <BannerDisplay position={currentPlan} mode="slider" />
                    </div>
                  </div>
                </React.Fragment>
              );
            }

            return postCard;
          })}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-slate-900/40 border border-slate-800 rounded-2xl max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={24} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay noticias en esta categoría</h3>
          <p className="text-sm text-gray-400 mb-6">
            Actualmente no hay artículos publicados en esta sección.
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
