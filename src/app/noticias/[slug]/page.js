import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdSettings } from '@/app/actions/settings';
import BannerDisplay from '@/components/ads/BannerDisplay';
import AdIframeInjector from '@/components/shared/AdIframeInjector';
import PublicSidebar from '@/components/layout/PublicSidebar';
import SponsorWatermark from '@/components/ads/SponsorWatermark';
import ShareButtons from '@/components/news/ShareButtons';
import SocialShareButtons from '@/components/shared/SocialShareButtons';
import CommentsSection from '@/components/news/CommentsSection';
import RelatedArticles from '@/components/noticias/RelatedArticles';
import { getPostBySlug } from '@/app/actions/posts';

export const revalidate = 60; // Cache ISR por 60 segundos (mejora radical de velocidad)
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

  // Use explicit excerpt if available, otherwise fallback to truncated content
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
  
  // Fetch settings and post concurrently for maximum speed
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
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-sm font-bold text-xs uppercase tracking-wider mb-4">
              {post.category || 'General'}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold leading-tight mb-6">
              {post.title}
            </h1>
            
            {/* Bajada / Subtitle (Copete) */}
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

          {/* Featured Image */}
          {post.coverImage && (
            <div className="relative w-full h-[350px] md:h-[500px] overflow-hidden mb-8 rounded-xl border border-border">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.coverImage})` }}
              />
              <SponsorWatermark postSponsorId={post.sponsorId} />
            </div>
          )}

          {/* Body and Share */}
          <div className="flex flex-col md:flex-row gap-8">
            <ShareButtons 
              url={`https://librecielo.com/noticias/${post.slug}`} 
              title={post.title} 
            />

            {/* Article Content */}
            <div className="flex-1">
              <div className="prose prose-lg dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-relaxed [&>div:first-child>p:first-of-type]:text-xl [&>div:first-child>p:first-of-type]:text-gray-500 [&>div:first-child>p:first-of-type]:font-medium [&>div:first-child>p:first-of-type]:mb-8">
                {(post.content?.split(/(\[banner:in-article\]|\[adsterra:in-article\]|\[banner:id:\d+\]|\[embed\][A-Za-z0-9+/=]+\[\/embed\])/g) || []).map((part, index) => {
                  if (part === '[banner:in-article]') {
                    return (
                      <div key={index} className="my-8 not-prose">
                        <BannerDisplay position="in-article" />
                      </div>
                    );
                  }
                  
                  if (part === '[adsterra:in-article]') {
                    return (
                      <div key={index} className="my-8 not-prose">
                        {inArticleScript && <AdIframeInjector htmlCode={inArticleScript} minHeight="250px" />}
                      </div>
                    );
                  }

                  if (part.startsWith('[banner:id:')) {
                    const bannerId = part.match(/\d+/)[0];
                    return (
                      <div key={index} className="my-8 not-prose flex justify-center">
                        <BannerDisplay position="in-article" specificId={parseInt(bannerId)} />
                      </div>
                    );
                  }

                  if (part.startsWith('[embed]') && part.endsWith('[/embed]')) {
                    const base64Content = part.replace('[embed]', '').replace('[/embed]', '');
                    try {
                      let decoded = '';
                      if (typeof Buffer !== 'undefined') {
                        decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
                      } else {
                        decoded = decodeURIComponent(escape(atob(base64Content)));
                      }
                      return (
                        <div key={index} className="my-8 not-prose w-full overflow-hidden flex justify-center">
                          <div dangerouslySetInnerHTML={{ __html: decoded }} />
                        </div>
                      );
                    } catch (e) {
                      return null;
                    }
                  }

                  return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
                })}
              </div>

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

              {/* Botones adicionales al final */}
              <SocialShareButtons title={post.title} slug={post.slug} />
            </div>
          </div>

          {/* In-Article / Bottom Banners */}
          <div className="mt-12">
            <BannerDisplay position="in-article" />
          </div>

          {/* Comments Section */}
          <CommentsSection postId={post.id} />

          <div className="mt-8 p-6 bg-surface border border-border text-center text-gray-500 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest mb-2 opacity-50">Publicidad</span>
            {inArticleScript ? (
              <div dangerouslySetInnerHTML={{ __html: inArticleScript }} />
            ) : (
              <div className="w-full max-w-[728px] h-[90px] bg-background border border-dashed border-gray-600 flex items-center justify-center text-sm">
                Espacio de Script Adsterra (728x90)
              </div>
            )}
          </div>

          <RelatedArticles category={post.category} currentPostId={post.id} />

        </article>

        {/* Right Sidebar: 4 columns */}
        <div className="lg:col-span-4">
          <PublicSidebar />
        </div>

      </div>
    </div>
  );
}
