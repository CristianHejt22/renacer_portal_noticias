import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BannerDisplay from "@/components/ads/BannerDisplay";
import PublicSidebar from "@/components/layout/PublicSidebar";
import SponsorWatermark from "@/components/ads/SponsorWatermark";

import { getPosts } from '@/app/actions/posts';

export const revalidate = 60; // 60 seconds ISR Cache

export default async function Home() {
  const postsRes = await getPosts();
  const allPosts = postsRes.data || [];
  const publishedPosts = allPosts.filter(p => p.isPublished);

  const featuredPost = publishedPosts.length > 0 ? publishedPosts[0] : null;
  const recentPosts = publishedPosts.length > 1 ? publishedPosts.slice(1, 7) : [];

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content: 8 columns on large screens */}
        <div className="lg:col-span-8">
          {/* Hero Section */}
          <section className="mb-12">
            {featuredPost ? (
              <Link href={`/noticias/${featuredPost.slug}`} className="block relative rounded-2xl overflow-hidden group cursor-pointer h-[500px]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${featuredPost.coverImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <SponsorWatermark postSponsorId={featuredPost.sponsorId} />
                
                <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
                  <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full mb-4">
                    {featuredPost.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {featuredPost.title}
                  </h1>
                  <p className="text-gray-300 text-lg mb-6 line-clamp-2 w-full md:w-3/4">
                    {featuredPost.content?.replace(/<[^>]+>/g, '') || featuredPost.excerpt}
                  </p>
                  <div className="flex items-center text-sm text-gray-400">
                    <span>{formatDate(featuredPost.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center group-hover:text-white transition-colors">
                      Leer artículo <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center h-[300px] bg-surface border border-border rounded-2xl">
                <p className="text-gray-500 text-xl">Aún no hay noticias publicadas.</p>
              </div>
            )}
          </section>

          <BannerDisplay position="plan-nacional" />

          {/* Recent News Grid */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold border-b-2 border-primary pb-2">Noticias Recientes</h2>
              <Link href="/noticias" className="text-primary hover:text-accent transition-colors flex items-center">
                Ver todas <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recentPosts.map((post) => (
                  <Link href={`/noticias/${post.slug}`} key={post.id} className="group cursor-pointer block bg-surface rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
                    <div className="relative h-48 w-full overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{ backgroundImage: `url(${post.coverImage})` }}
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-accent text-xs font-bold uppercase tracking-wider mb-2 block">{post.category}</span>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay noticias recientes.</p>
            )}
          </section>
        </div>

        {/* Sidebar: 4 columns on large screens */}
        <div className="lg:col-span-4">
          <PublicSidebar />
        </div>
      </div>
    </div>
  );
}
