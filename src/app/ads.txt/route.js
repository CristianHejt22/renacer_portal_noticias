import { getAdSettings } from '@/app/actions/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  const adSettings = await getAdSettings();
  const clientId = adSettings.data?.adsenseClientId || 'ca-pub-5460050326198241';
  
  // Format publisher ID without "ca-" prefix for ads.txt if present
  const pubId = clientId.replace('ca-', '');
  
  const content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
