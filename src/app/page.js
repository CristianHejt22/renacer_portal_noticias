import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import BannerDisplay from "@/components/ads/BannerDisplay";
import PublicSidebar from "@/components/layout/PublicSidebar";
import SponsorWatermark from "@/components/ads/SponsorWatermark";
import FeaturedClassifieds from "@/components/classifieds/FeaturedClassifieds";

import { getHomePosts } from '@/app/actions/posts';

export const revalidate = 60; // 60 seconds ISR Cache

export default async function Home() {
  const postsRes = await getHomePosts();
  const allPosts = postsRes.data || [];
  const publishedPosts = allPosts; // already filtered by isPublished in the query

  // Fetch ad settings for Adsterra
  const { getAdSettings } = await import('@/app/actions/settings');
  const settingsRes = await getAdSettings();
  const adSettings = settingsRes?.data || {};

  const featuredPost = publishedPosts.length > 0 ? publishedPosts[0] : null;
  const recentPosts = publishedPosts.length > 1 ? publishedPosts.slice(1, 40) : [];

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 2xl:gap-12">
        
        {/* Main Content: 8 columns on large screens, 9 columns on huge screens */}
        <div className="lg:col-span-8 xl:col-span-9">
          {/* Hero Section */}
          <section className="mb-12">
            {featuredPost ? (
              <Link href={`/noticias/${featuredPost.slug}`} className="block relative rounded-2xl overflow-hidden group cursor-pointer h-[500px] xl:h-[650px] bg-black/90 shadow-2xl">
                {/* Blurred background */}
                <Image 
                  src={featuredPost.coverImage || '/placeholder.jpg'} 
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover opacity-40 blur-2xl scale-110 transition-transform duration-700 group-hover:scale-125"
                />
                {/* Contained image */}
                <img 
                  src={featuredPost.coverImage || '/placeholder.jpg'} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <SponsorWatermark postSponsorId={featuredPost.sponsorId} />
                
                <div className="absolute bottom-0 left-0 p-8 md:p-12 xl:p-16 w-full">
                  <span className="inline-block px-4 py-1.5 bg-primary text-white text-sm xl:text-base font-bold tracking-wider uppercase rounded-full mb-4 shadow-lg backdrop-blur-sm bg-primary/90">
                    {featuredPost.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl xl:text-6xl font-black text-white mb-6 leading-tight drop-shadow-2xl">
                    {featuredPost.title}
                  </h1>
                  <p className="text-gray-200 text-lg xl:text-xl mb-8 line-clamp-2 w-full md:w-3/4 drop-shadow-md">
                    {featuredPost.excerpt || featuredPost.content?.replace(/<[^>]+>/g, '')}
                  </p>
                  <div className="flex items-center text-sm xl:text-base font-medium text-gray-300">
                    <span>{formatDate(featuredPost.createdAt)}</span>
                    <span className="mx-3 text-primary">•</span>
                    <span className="flex items-center text-white group-hover:text-primary transition-colors">
                      Leer artículo completo <ArrowRight className="ml-2 w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-surface border border-border rounded-2xl">
                <p className="text-gray-500 text-xl">Aún no hay noticias publicadas.</p>
              </div>
            )}
          </section>

          <BannerDisplay position="plan-nacional" />

          {/* Recent News Grid */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black border-b-4 border-primary pb-2 uppercase tracking-wide">Noticias de Hoy</h2>
              <Link href="/noticias" className="text-primary hover:text-accent font-bold transition-colors flex items-center bg-primary/10 px-4 py-2 rounded-lg">
                Ver todas <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            {recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 gap-8">
                {recentPosts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <Link href={`/noticias/${post.slug}`} className="group cursor-pointer flex flex-col bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
                      <div className="relative h-60 xl:h-64 w-full overflow-hidden bg-black/5 dark:bg-white/5">
                        <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-primary/95 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
                          {post.category}
                        </span>
                        {/* Blurred background */}
                        <Image 
                          src={post.coverImage || '/placeholder.jpg'} 
                          alt=""
                          fill
                          sizes="100vw"
                          className="object-cover opacity-30 blur-md scale-110 transition-transform duration-500 group-hover:scale-125"
                        />
                        {/* Contained image */}
                        <img 
                          src={post.coverImage || '/placeholder.jpg'} 
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-6 xl:p-8 flex flex-col flex-1">
                        <h3 className="text-xl xl:text-2xl font-bold mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-3">
                          {post.title}
                        </h3>
                        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                          <p className="text-sm text-gray-500 font-medium">{formatDate(post.createdAt)}</p>
                          <span className="text-primary/70 group-hover:text-primary bg-primary/10 p-2 rounded-full transition-colors">
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Official Sponsor Banners (Only specific positions) */}
                    {index === 1 && (
                      <div className="col-span-1 md:col-span-2 xl:col-span-3 3xl:col-span-4 my-2">
                        <BannerDisplay position="plan-local" />
                      </div>
                    )}
                    
                    {index === 3 && (
                      <div className="col-span-1 md:col-span-2 xl:col-span-3 3xl:col-span-4 my-2">
                        <BannerDisplay position="plan-deportivo" />
                      </div>
                    )}

                    {/* Infinite Adsterra Injection (every 4 posts starting at index 2) */}
                    {(index % 4 === 2) && adSettings.inArticleScript && (
                      <div className="col-span-1 md:col-span-2 xl:col-span-3 3xl:col-span-4 my-8 bg-black/5 dark:bg-white/5 p-8 rounded-3xl border border-border/50 text-center flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                        <span className="text-[10px] xl:text-xs font-bold uppercase tracking-[0.3em] text-gray-400/80 mb-6 bg-background px-4 py-1.5 rounded-full border border-border/50">Anuncio Publicitario</span>
                        <div dangerouslySetInnerHTML={{ __html: adSettings.inArticleScript }} className="w-full overflow-hidden flex justify-center scale-100 xl:scale-110 origin-center transition-transform" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay noticias recientes.</p>
            )}
          </section>

          {/* Plan Internacional before Classifieds */}
          <div className="mt-12 mb-6">
            <BannerDisplay position="plan-internacional" />
          </div>

          {/* Featured Classifieds */}
          <FeaturedClassifieds />
        </div>

        {/* Sidebar: 4 columns on large screens */}
        <div className="lg:col-span-4">
          <PublicSidebar />
        </div>
      </div>
    </div>
  );
}
