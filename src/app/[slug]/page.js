import { getPageBySlug } from '@/app/actions/pages';
import { getPosts } from '@/app/actions/posts';
import BannerDisplay from '@/components/ads/BannerDisplay';
import Link from 'next/link';
import { Tweet } from 'react-tweet';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const res = await getPageBySlug(resolvedParams.slug);
  const page = res.data;

  if (!page || !page.isPublished) {
    return {
      title: 'Página no encontrada',
    };
  }

  // Extract a brief excerpt for description by stripping HTML
  const description = page.content?.replace(/<[^>]+>/g, '').substring(0, 160) + '...';

  return {
    title: page.title,
    description: description,
    openGraph: {
      title: page.title,
      description: description,
      type: 'website',
    },
  };
}

export const revalidate = 60; // Revalidate every 60s

async function LatestNewsShortcode() {
  const res = await getPosts();
  const posts = (res.data || []).filter(p => p.isPublished).slice(0, 3); // Get 3 latest news

  if (posts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
      {posts.map((post) => (
        <Link href={`/noticias/${post.slug}`} key={post.id} className="group cursor-pointer block bg-surface border border-border rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col">
          <div className="relative h-48 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url(${post.coverImage})` }}
            />
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <span className="text-accent text-xs font-medium mb-2 block">{post.category}</span>
            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function DynamicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const res = await getPageBySlug(slug);
  
  if (!res.success || !res.data || !res.data.isPublished) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-500">Página no encontrada</h1>
      </div>
    );
  }

  const page = res.data;
  
  // Simple shortcode parser
  const parts = page.content.split(/(\[latest-news\]|\[banner:home\]|\[tweet:\d+\]|\[embed\][A-Za-z0-9+/=]+\[\/embed\])/g);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-28">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center">{page.title}</h1>
      
      <div className="prose prose-lg prose-invert max-w-none text-gray-300">
        {parts.map((part, index) => {
          if (part === '[latest-news]') {
            return <LatestNewsShortcode key={index} />;
          }
          if (part === '[banner:home]') {
            return <div key={index} className="my-8"><BannerDisplay position="home" /></div>;
          }
          if (part && part.startsWith('[tweet:')) {
            const tweetId = part.replace('[tweet:', '').replace(']', '');
            return (
              <div key={index} className="my-8 not-prose flex justify-center w-full">
                <Tweet id={tweetId} />
              </div>
            );
          }
          if (part && part.startsWith('[embed]') && part.endsWith('[/embed]')) {
            const base64Content = part.replace('[embed]', '').replace('[/embed]', '');
            try {
              let decoded = '';
              if (typeof Buffer !== 'undefined') {
                decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
              } else {
                decoded = decodeURIComponent(escape(atob(base64Content)));
              }

              if (decoded.trim().toLowerCase().startsWith('<iframe') && decoded.trim().toLowerCase().endsWith('</iframe>') && (decoded.match(/<iframe/ig) || []).length === 1) {
                return (
                  <div key={index} className="my-8 w-full flex justify-center">
                    <div dangerouslySetInnerHTML={{ __html: decoded }} className="w-full max-w-[800px] flex justify-center" />
                  </div>
                );
              }

              return (
                <div key={index} className="my-8 w-full overflow-hidden flex justify-center">
                  <AdIframeInjector htmlCode={decoded} minHeight="600px" />
                </div>
              );
            } catch (e) {
              return null;
            }
          }
          return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        })}
      </div>
    </div>
  );
}
