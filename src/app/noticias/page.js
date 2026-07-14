import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { getPosts } from '@/app/actions/posts';
import BannerDisplay from '@/components/ads/BannerDisplay';
import FeaturedClassifieds from '@/components/classifieds/FeaturedClassifieds';

export default async function NoticiasPage({ searchParams }) {
  const { category: categorySlug } = await searchParams;
  
  const res = await getPosts();
  const allPosts = res.data || [];
  let posts = allPosts.filter(p => p.isPublished);

  // Filter by category slug if provided (case-insensitive for slug)
  let categoryName = "Últimas Noticias";
  if (categorySlug) {
    posts = posts.filter(p => 
      p.category && p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
    );
    categoryName = posts.length > 0 ? posts[0].category : categorySlug;
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Determine which banner plan to show based on category
  const slug = (categorySlug || '').toLowerCase();
  let planPosition = null;
  if (slug === 'nacional') planPosition = 'plan-nacional';
  else if (slug === 'local') planPosition = 'plan-local';
  else if (slug === 'deportes') planPosition = 'plan-deportivo';
  else if (['mundo', 'internacional', 'tendencias'].includes(slug)) planPosition = 'plan-internacional';
  else if (!slug) planPosition = 'plan-cielo-total';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center capitalize">{categoryName}</h1>
      
      {/* HEADER BANNER PARA PLAN INTERNACIONAL O DEPORTIVO */}
      {(planPosition === 'plan-internacional' || planPosition === 'plan-deportivo') && (
        <div className="mb-8">
          <BannerDisplay position={planPosition} />
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => {
            const postCard = (
              <Link href={`/noticias/${post.slug}`} key={post.id} className="group cursor-pointer block bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <Image 
                    src={post.coverImage || '/placeholder.jpg'}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-accent text-sm font-medium mb-2 block">{post.category}</span>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                    {post.excerpt || post.content?.replace(/<[^>]+>/g, '')}
                  </p>
                  <div className="text-sm text-gray-500 font-medium">
                    {formatDate(post.createdAt)}
                  </div>
                </div>
              </Link>
            );

            let showCieloTotal = planPosition === 'plan-cielo-total' && (index + 1) % 6 === 0;
            let showOtherPlans = planPosition !== 'plan-cielo-total' && planPosition !== null && (index + 1) % 3 === 0;

            if (showCieloTotal || showOtherPlans) {
              return (
                <React.Fragment key={`group-${index}`}>
                  {postCard}
                  {(planPosition === 'plan-nacional' || showCieloTotal) && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4">
                      <BannerDisplay position={planPosition} />
                    </div>
                  )}
                  {planPosition === 'plan-local' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 my-4 flex justify-center">
                       {/* El plan local es cuadrado, le damos un ancho máximo */}
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
        <div className="text-center py-20 bg-surface border border-border rounded-xl">
          <p className="text-xl text-gray-400">Aún no hay noticias publicadas.</p>
        </div>
      )}

      {/* Featured Classifieds at the bottom of the news listing */}
      <div className="mt-16">
        <FeaturedClassifieds />
      </div>
    </div>
  );
}
