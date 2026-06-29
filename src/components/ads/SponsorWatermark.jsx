import { getAdSettings } from '@/app/actions/settings';
import { getBanners } from '@/app/actions/banners';

export default async function SponsorWatermark({ postSponsorId }) {
  try {
    const settingsRes = await getAdSettings();
    const bannersRes = await getBanners();

    if (!bannersRes.success || !bannersRes.data) return null;

    const watermarkBanners = bannersRes.data.filter(b => b.position === 'watermark' && b.isActive);
    if (watermarkBanners.length === 0) return null;

    let selectedSponsor = null;
    
    // Si la noticia tiene un sponsor específico, lo usamos
    if (postSponsorId) {
      selectedSponsor = watermarkBanners.find(b => b.id === parseInt(postSponsorId));
    }

    // Si no tiene sponsor específico, usamos la configuración global
    if (!selectedSponsor) {
      const mode = settingsRes.data?.sponsorMode || 'random';

      if (mode === 'fixed') {
        const fixedId = parseInt(settingsRes.data?.sponsorFixedId);
        selectedSponsor = watermarkBanners.find(b => b.id === fixedId);
      }

      if (!selectedSponsor) {
        // Pick random
        const randomIndex = Math.floor(Math.random() * watermarkBanners.length);
        selectedSponsor = watermarkBanners[randomIndex];
      }
    }

    if (!selectedSponsor) return null;

    const Content = () => (
      <div className="absolute top-4 right-4 z-10 transition-transform hover:scale-105 opacity-80 hover:opacity-100 drop-shadow-md">
        <img 
          src={selectedSponsor.imageUrl} 
          alt={selectedSponsor.name || 'Patrocinador'} 
          className="w-auto h-12 md:h-16 object-contain"
        />
      </div>
    );

    if (selectedSponsor.targetUrl) {
      return (
        <a href={selectedSponsor.targetUrl} target="_blank" rel="noreferrer" className="block">
          <Content />
        </a>
      );
    }

    return <Content />;
  } catch (error) {
    return null;
  }
}
