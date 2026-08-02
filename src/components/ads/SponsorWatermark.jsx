import { getAdSettings } from '@/app/actions/settings';
import { getBanners } from '@/app/actions/banners';

export default async function SponsorWatermark({ postSponsorId }) {
  let settingsRes = null;
  let bannersRes = null;

  try {
    [settingsRes, bannersRes] = await Promise.all([
      getAdSettings(),
      getBanners()
    ]);
  } catch (error) {
    console.error('Error loading sponsor watermark:', error);
    return null;
  }

  if (!bannersRes?.success || !bannersRes?.data) return null;

  const watermarkBanners = bannersRes.data.filter(b => b.position === 'watermark' && b.isActive);
  if (watermarkBanners.length === 0) return null;

  let selectedSponsor = null;

  if (postSponsorId) {
    selectedSponsor = watermarkBanners.find(b => b.id === parseInt(postSponsorId, 10));
  }

  if (!selectedSponsor) {
    const mode = settingsRes?.data?.sponsorMode || 'random';

    if (mode === 'fixed') {
      const fixedId = parseInt(settingsRes?.data?.sponsorFixedId, 10);
      selectedSponsor = watermarkBanners.find(b => b.id === fixedId);
    }

    if (!selectedSponsor) {
      selectedSponsor = watermarkBanners[0];
    }
  }

  if (!selectedSponsor?.imageUrl) return null;

  return (
    <div className="absolute top-4 right-4 z-10 opacity-80 drop-shadow-md pointer-events-none select-none">
      <img 
        src={selectedSponsor.imageUrl} 
        alt={selectedSponsor.name || 'Patrocinador'} 
        className="w-auto h-12 md:h-16 object-contain"
      />
    </div>
  );
}
