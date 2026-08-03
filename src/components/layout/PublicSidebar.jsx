import BannerDisplay from '@/components/ads/BannerDisplay';
import Link from 'next/link';
import { getRecentPosts } from '@/app/actions/posts';
import { getAdSettings } from '@/app/actions/settings';
import AdIframeInjector from '@/components/shared/AdIframeInjector';
import SidebarClassifieds from '@/components/classifieds/SidebarClassifieds';
import AdSenseUnit from '@/components/ads/AdSenseUnit';

export default async function PublicSidebar() {
  const [res, settingsRes] = await Promise.all([
    getRecentPosts(4),
    getAdSettings()
  ]);
  const popularNews = res.data || [];
  const adSettings = settingsRes?.data || {};

  const adsenseClientId = adSettings.adsenseClientId || 'ca-pub-5460050326198241';
  const adsenseSidebarSlot = adSettings.adsenseSidebarSlot || '';
  const adsenseEnabled = adSettings.adsenseEnabled !== false;

  return (
    <aside className="w-full flex flex-col gap-8">
      {/* Banner Superior del Sidebar */}
      <div className="w-full space-y-6">
        <BannerDisplay position="sidebar" />
        
        {/* Espacio Lateral para Google AdSense */}
        {adsenseEnabled && (
          <AdSenseUnit 
            client={adsenseClientId}
            slot={adsenseSidebarSlot}
            format="auto"
            responsive="true"
            minHeight="250px"
          />
        )}

        {/* Banner Adsterra (Visible en Móvil y PC) */}
        {adSettings.sidebarScript && (
          <div className="block w-full text-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded mb-2 inline-block">Publicidad</span>
            <AdIframeInjector htmlCode={adSettings.sidebarScript} minHeight="250px" />
          </div>
        )}
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

      {/* Clasificados en el Sidebar */}
      <SidebarClassifieds />

      {/* Banner Inferior del Sidebar y Rascacielos Sticky */}
      <div className="w-full sticky top-24 space-y-8">
        <BannerDisplay position="sidebar" />
        
        {/* Espacio Lateral Sticky Google AdSense */}
        {adsenseEnabled && (
          <AdSenseUnit 
            client={adsenseClientId}
            slot={adsenseSidebarSlot}
            format="vertical"
            responsive="true"
            minHeight="350px"
          />
        )}

        {/* Banner Adsterra PC (Lateral 2) */}
        {adSettings.sidebarScript && (
          <div className="hidden lg:block w-full text-center">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded mb-2 inline-block">Publicidad</span>
            <AdIframeInjector htmlCode={adSettings.sidebarScript} minHeight="250px" />
          </div>
        )}
        
        <BannerDisplay position="sidebar" />
      </div>
    </aside>
  );
}
