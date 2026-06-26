import BannerDisplay from '@/components/ads/BannerDisplay';
import Link from 'next/link';
import { getPosts } from '@/app/actions/posts';

export default async function PublicSidebar() {
  const res = await getPosts();
  const allPosts = res.data || [];
  
  // Como no hay contador de visitas por ahora, tomamos las más recientes
  const popularNews = allPosts
    .filter(p => p.isPublished)
    .slice(0, 4);

  return (
    <aside className="w-full flex flex-col gap-8">
      {/* Banner Superior del Sidebar */}
      <div className="w-full">
        <BannerDisplay position="sidebar" />
      </div>

      {/* Lo Más Leído */}
      {popularNews.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center border-b border-border pb-2">
            <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
            Lo más leído
          </h3>
          <div className="space-y-4">
            {popularNews.map((news, index) => (
              <Link href={`/noticias/${news.slug}`} key={news.id} className="group flex gap-4 items-start">
                <span className="text-3xl font-bold text-border group-hover:text-primary transition-colors">
                  {index + 1}
                </span>
                <div>
                  <span className="text-xs text-accent font-medium">{news.category}</span>
                  <h4 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                    {news.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Banner Inferior del Sidebar */}
      <div className="w-full sticky top-24">
        <BannerDisplay position="sidebar" />
      </div>
    </aside>
  );
}
