import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import BannerDisplay from "@/components/ads/BannerDisplay";
import PublicSidebar from "@/components/layout/PublicSidebar";
import SponsorWatermark from "@/components/ads/SponsorWatermark";
import FeaturedClassifieds from "@/components/classifieds/FeaturedClassifieds";
import AdsterraBlock from "@/components/ads/AdsterraBlock";

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
  
  // Split posts to fill empty space on PC next to the sidebar
  // 12 posts will create 4 rows of 3 columns, perfectly filling massive vertical sidebars on PC
  const topNewsBatch = recentPosts.slice(0, 12);
  const remainingNewsBatch = recentPosts.slice(12);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Helper component to render a news card to avoid duplication
  const NewsCard = ({ post }) => (
    <Link href={`/noticias/${post.slug}`} className="col-span-1 group cursor-pointer flex flex-col bg-surface rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
      <div className="relative h-60 w-full overflow-hidden bg-black/5 dark:bg-white/5">
        <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-primary/95 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg">
          {post.category}
        </span>
        <Image 
          src={post.coverImage || '/placeholder.jpg'} 
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-30 blur-md scale-110 transition-transform duration-500 group-hover:scale-125"
        />
        <img 
          src={post.coverImage || '/placeholder.jpg'} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg xl:text-xl font-bold mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-3">
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
  );

  return (
    <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      
      {/* HERO & SIDEBAR SECTION (Top part of page) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 2xl:gap-12">
        
        {/* Main Hero Content + Top News Batch (To fill vertical space) */}
        <div className="xl:col-span-9 lg:col-span-8">
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
          
          {/* Fill empty space under Hero (before Sidebar finishes) */}
          {topNewsBatch.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border/50">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black border-l-4 border-primary pl-4 uppercase tracking-wide">Últimas Noticias</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {topNewsBatch.map((post, index) => (
                  <React.Fragment key={post.id}>
                    <NewsCard post={post} />
                    
                    {/* Interleave Ads inside the top batch */}
                    {(index === 2 || index === 7) && (adSettings.inArticleScript || true) && (
                      <div className="col-span-1 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors shadow-inner min-h-[350px]">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 bg-muted px-3 py-1 rounded-full border border-border">Anuncio</span>
                        {index === 2 && adSettings.inArticleScript ? (
                          <AdsterraBlock html={adSettings.inArticleScript} />
                        ) : (
                          <div className="w-[300px] h-[250px] flex items-center justify-center overflow-hidden">
                            <BannerDisplay position="plan-local" mode="slider" hideUI={true} />
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-3 lg:col-span-4">
          <PublicSidebar />
        </div>
      </div>

      {/* FULL WIDTH RECENT NEWS SECTION (Bottom part of page) */}
      {remainingNewsBatch.length > 0 && (
        <section className="mt-8 pt-8 border-t border-border/50 w-full">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black border-l-4 border-primary pl-4 uppercase tracking-wide">Más Actualidad</h2>
            <Link href="/noticias" className="text-primary hover:text-accent font-bold transition-colors flex items-center bg-primary/10 px-4 py-2 rounded-lg">
              Ver todas <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {remainingNewsBatch.map((post, index) => {
              const showAdCard = index % 5 === 3;
              const isOwnAd = index % 15 === 8; // 1/3 of the time it's own ad, 2/3 Adsterra

              return (
                <React.Fragment key={post.id}>
                  
                  <NewsCard post={post} />
                  
                  {/* Official Sponsor Banners (Full width break) */}
                  {index === 4 && (
                    <div className="col-span-full my-4">
                      <BannerDisplay position="plan-local" />
                    </div>
                  )}
                  
                  {index === 14 && (
                    <div className="col-span-full my-4">
                      <BannerDisplay position="plan-deportivo" />
                    </div>
                  )}

                  {/* Interleaved Grid Card Ads */}
                  {showAdCard && (
                    <div className="col-span-1 flex flex-col items-center justify-center bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-border/50 hover:border-primary/30 transition-colors shadow-inner min-h-[350px]">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-4 bg-muted px-3 py-1 rounded-full border border-border">Anuncio</span>
                      
                      {isOwnAd || !adSettings.inArticleScript ? (
                        <div className="w-[300px] h-[250px] flex items-center justify-center overflow-hidden">
                          <BannerDisplay position="plan-local" mode="slider" hideUI={true} />
                        </div>
                      ) : (
                        <AdsterraBlock html={adSettings.inArticleScript} />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>
      )}

      {/* Plan Internacional before Classifieds */}
      <div className="mt-12 mb-6">
        <BannerDisplay position="plan-internacional" />
      </div>

      {/* Featured Classifieds */}
      <FeaturedClassifieds />
    </div>
  );
}
