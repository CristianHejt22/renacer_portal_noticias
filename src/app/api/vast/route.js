import { NextResponse } from 'next/server';
import { getAdSettings } from '@/app/actions/settings';

export async function GET(request) {
  try {
    const { data } = await getAdSettings();
    const { vastCustomVideo, vastCustomLink } = data;

    if (!vastCustomVideo) {
      return new NextResponse('No custom video configured', { status: 404 });
    }

    // Asegurarnos de que las URLs son absolutas si es posible (recomendado para VAST)
    const host = request.headers.get('host') || 'librecielo.com';
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = `${protocol}://${host}`;

    const videoUrl = vastCustomVideo.startsWith('http') ? vastCustomVideo : `${baseUrl}${vastCustomVideo}`;
    const clickUrl = vastCustomLink ? (vastCustomLink.startsWith('http') ? vastCustomLink : `${baseUrl}${vastCustomLink}`) : baseUrl;

    // Generar XML VAST 3.0
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<VAST version="3.0">
  <Ad id="1">
    <InLine>
      <AdSystem>Renacer VAST Server</AdSystem>
      <AdTitle>Patrocinador Propio</AdTitle>
      <Impression><![CDATA[${baseUrl}/api/vast/impression]]></Impression>
      <Creatives>
        <Creative id="video-ad-1">
          <Linear>
            <Duration>00:00:15</Duration>
            <TrackingEvents>
              <Tracking event="start"><![CDATA[${baseUrl}/api/vast/start]]></Tracking>
              <Tracking event="firstQuartile"><![CDATA[${baseUrl}/api/vast/firstQuartile]]></Tracking>
              <Tracking event="midpoint"><![CDATA[${baseUrl}/api/vast/midpoint]]></Tracking>
              <Tracking event="thirdQuartile"><![CDATA[${baseUrl}/api/vast/thirdQuartile]]></Tracking>
              <Tracking event="complete"><![CDATA[${baseUrl}/api/vast/complete]]></Tracking>
            </TrackingEvents>
            <VideoClicks>
              <ClickThrough><![CDATA[${clickUrl}]]></ClickThrough>
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
