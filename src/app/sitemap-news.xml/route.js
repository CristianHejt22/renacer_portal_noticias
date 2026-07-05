import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'librecielo.com';
    const siteUrl = `${protocol}://${host}`;

    const siteNameSetting = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    const siteTitle = siteNameSetting?.value || 'THE DINNER Portal';

    // Google News sitemaps only include articles published in the last 2 days (48 hours)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const posts = await prisma.post.findMany({
      where: { 
        isPublished: true,
        createdAt: {
          gte: twoDaysAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    posts.forEach(post => {
      const postUrl = `${siteUrl}/noticias/${post.slug}`;
      const pubDate = new Date(post.createdAt).toISOString();
      const language = 'es';
      
      xml += `
  <url>
    <loc>${postUrl}</loc>
    <news:news>
      <news:publication>
        <news:name><![CDATA[${siteTitle}]]></news:name>
        <news:language>${language}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title><![CDATA[${post.title}]]></news:title>
    </news:news>
  </url>`;
    });

    xml += `\n</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating Google News sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
