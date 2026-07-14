import { getAdSettings } from '@/app/actions/settings';

export default async function manifest() {
  const adSettings = await getAdSettings();
  const siteName = adSettings.data?.siteName || 'Librecielo Portal';
  const siteDescription = adSettings.data?.siteDescription || 'Portal de Noticias y Clasificados';
  const siteLogo = adSettings.data?.siteLogo || '/icon-512x512.png';

  return {
    name: siteName,
    short_name: siteName.split(' ')[0],
    description: siteDescription,
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: siteLogo,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: siteLogo,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
