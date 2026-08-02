import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdSettings } from '@/app/actions/settings';
import BannerDisplay from '@/components/ads/BannerDisplay';
import PublicSidebar from '@/components/layout/PublicSidebar';
import VideoVastHydrator from '@/components/news/VideoVastHydrator';
import ShareButtons from '@/components/news/ShareButtons';
import SocialShareButtons from '@/components/shared/SocialShareButtons';
import CommentsSection from '@/components/news/CommentsSection';
import RelatedArticles from '@/components/noticias/RelatedArticles';
import { getPostBySlug } from '@/app/actions/posts';
import FeaturedClassifieds from '@/components/classifieds/FeaturedClassifieds';
import SaveButton from '@/components/shared/SaveButton';
import NewsGallerySlider from '@/components/news/NewsGallerySlider';
import ArticleContentRenderer from '@/components/news/ArticleContentRenderer';
import AdIframeInjector from '@/components/shared/AdIframeInjector';

export const revalidate = 60; // Cache ISR por 60 segundos
export const dynamicParams = true;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const res = await getPostBySlug(resolvedParams.slug);
  const post = res.data;

  if (!post) {
    return {
      title: 'Noticia no encontrada',
    };
  }

  const description = post.excerpt || (post.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...');

  return {
    title: post.title,
    description: description,
    keywords: post.tags ? post.tags.split(',') : [],
    authors: [{ name: post.author?.name || 'Redacción' }],
    openGraph: {
      title: post.title,
      description: description,
      url: `https://librecielo.com/noticias/${post.slug}`,
      type: 'article',
      publishedTime: post.createdAt,
      authors: [post.author?.name || 'Redacción'],
      images: post.coverImage ? [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  
  const [adSettings, res] = await Promise.all([
    getAdSettings(),
    getPostBySlug(resolvedParams.slug)
  ]);
  
  const inArticleScript = adSettings.data?.inArticleScript || '';
  const post = res.data;

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Noticia no encontrada</h1>
        <Link href="/noticias" className="text-primary hover:underline">
          Volver a noticias
        </Link>
      </div>
    );
  }

  // Extract all images from content to enrich the gallery slider
  const contentImages = [];
  if (post.content) {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(post.content)) !== null) {
      if (match[1] && !match[1].includes('data:image') && !match[1].includes('badge')) {
        contentImages.push(match[1]);
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumb / Back button */}
      <Link href="/noticias" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 font-medium transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Volver a noticias
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Article Content: 8 columns */}
        <article className="lg:col-span-8">
          
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-sm font-bold text-xs uppercase tracking-wider">
                {post.category || 'General'}
              </span>
              <SaveButton type="post" id={post.id} />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>
            
            {/* Subtitle / Copete */}
            {post.excerpt && (
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-6 pb-6 border-b border-border">
              <span className="font-bold text-foreground">{post.author?.name || 'Redacción Renacer'}</span>
              <span>•</span>
              <span>{new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="mb-6">
              <BannerDisplay position="article-top" />
            </div>
          </header>

          {/* Interactive Gallery Slider with Lightbox */}
          {(post.coverImage || contentImages.length > 0) && (
            <NewsGallerySlider 
              coverImage={post.coverImage}
              images={contentImages}
              title={post.title}
              sponsorId={post.sponsorId}
            />
          )}

          {/* Body and Share */}
          <div className="flex flex-col md:flex-row gap-8">
            <ShareButtons 
              shortPath={`/n/${post.id}`} 
              title={post.title} 
            />

            {/* Article Content with Lightbox on click and auto-interleaved ad plans */}
            <div className="flex-1">
              <ArticleContentRenderer 
                content={post.content}
                inArticleScript={inArticleScript}
                articleTitle={post.title}
                category={post.category}
              />

              {/* Tags / Hashtags */}
              {post.tags && (
                <div className="mt-8 pt-6 flex flex-wrap gap-2">
                  {post.tags.split(',').map((tag, index) => {
                    const cleanTag = tag.trim().replace(/^#/, '');
                    if (!cleanTag) return null;
                    return (
                      <span key={index} className="px-3 py-1 bg-surface border border-border text-gray-400 text-sm rounded-full cursor-default hover:text-primary transition-colors">
                        #{cleanTag}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Social share */}
              <SocialShareButtons title={post.title} slug={post.slug} shortPath={`/n/${post.id}`} />
            </div>
          </div>

          <VideoVastHydrator />

          {/* In-Article / Bottom Banners */}
          <div className="mt-12">
            <BannerDisplay position="in-article" />
          </div>

          {/* Comments Section */}
          <CommentsSection postId={post.id} />

          <div className="mt-8 p-6 bg-surface border border-border text-center text-gray-500 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest mb-2 opacity-50">Publicidad</span>
            {inArticleScript ? (
              <AdIframeInjector htmlCode={inArticleScript} minHeight="90px" />
            ) : (
              <div className="w-full max-w-[728px] h-[90px] bg-background border border-dashed border-gray-600 flex items-center justify-center text-sm">
                Espacio de Script Adsterra (728x90)
              </div>
            )}
          </div>

          <RelatedArticles category={post.category} currentPostId={post.id} />

          <div className="mt-12">
            <FeaturedClassifieds />
          </div>

        </article>

        {/* Right Sidebar: 4 columns */}
        <div className="lg:col-span-4">
          <PublicSidebar />
        </div>

      </div>
    </div>
  );
}
