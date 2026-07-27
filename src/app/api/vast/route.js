import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse('Banner ID is required', { status: 400 });
    }

    const banner = await prisma.bannerAd.findUnique({
      where: { id: parseInt(id) }
    });

    if (!banner || !banner.isActive || banner.position !== 'vast-preroll') {
      return new NextResponse('Banner not found or inactive', { status: 404 });
    }

    // Asegurarnos de que las URLs son absolutas si es posible (recomendado para VAST)
    const host = request.headers.get('host') || 'librecielo.com';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    // Si la URL del banner ya es un XML externo, simplemente redirigimos o devolvemos error (aunque el frontend debería haberlo manejado)
    if (banner.imageUrl.endsWith('.xml')) {
       return NextResponse.redirect(banner.imageUrl);
    }

    const videoUrl = banner.imageUrl.startsWith('http') ? banner.imageUrl : `${baseUrl}${banner.imageUrl}`;
    const clickUrl = banner.targetUrl ? (banner.targetUrl.startsWith('http') ? banner.targetUrl : `${baseUrl}${banner.targetUrl}`) : baseUrl;

    // Generar XML VAST 3.0
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="${banner.id}">
    <InLine>
      <AdSystem>Renacer VAST Server</AdSystem>
      <AdTitle><![CDATA[${banner.name}]]></AdTitle>
      <Impression><![CDATA[${baseUrl}/api/banner/click?id=${banner.id}&type=view]]></Impression>
      <Creatives>
        <Creative id="video-ad-${banner.id}">
          <Linear>
            <Duration>00:00:15</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[${baseUrl}/api/banner/click?id=${banner.id}&type=view]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[${baseUrl}/api/banner/click?id=${banner.id}]]></ClickThrough>
            </VideoClicks>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1280" height="720" scalable="true" maintainAspectRatio="true">
                <![CDATA[${videoUrl}]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error generating VAST XML:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
