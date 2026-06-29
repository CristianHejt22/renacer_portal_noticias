import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // 1. Obtener la URL base del sitio desde la petición o variable de entorno
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const siteUrl = `${protocol}://${host}`;

    // 2. Obtener configuraciones del sitio
    const siteNameSetting = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    const siteDescSetting = await prisma.setting.findUnique({ where: { key: 'site_description' } });
    
    const siteTitle = siteNameSetting?.value || 'THE DINNER Portal';
    const siteDescription = siteDescSetting?.value || 'Portal de noticias';

    // 3. Obtener las últimas 20 noticias publicadas
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { author: true },
    });

    // 4. Construir el XML (RSS 2.0)
    let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <link>${siteUrl}</link>
    <description><![CDATA[${siteDescription}]]></description>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />`;

    posts.forEach(post => {
      const postUrl = `${siteUrl}/noticias/${post.slug}`;
      const pubDate = new Date(post.createdAt).toUTCString();
      const imageUrl = post.imageUrl ? (post.imageUrl.startsWith('http') ? post.imageUrl : `${siteUrl}${post.imageUrl}`) : '';
      
      rss += `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      ${post.category ? `<category><![CDATA[${post.category}]]></category>` : ''}
      ${imageUrl ? `<media:content url="${imageUrl}" type="image/jpeg" medium="image" />` : ''}
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    // 5. Devolver la respuesta con el tipo de contenido XML
    return new NextResponse(rss, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new NextResponse('Error generating feed', { status: 500 });
  }
}
