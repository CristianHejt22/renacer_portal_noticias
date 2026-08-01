import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed duration on Vercel Pro/serverless

const prisma = new PrismaClient();

// List of phrases to ignore/filter out from paragraphs
const JUNK_PHRASES = [
  "suscríbete a nuestro newsletter",
  "suscribite a nuestro newsletter",
  "sumate al canal",
  "sumate a la comunidad",
  "seguinos en",
  "leé más",
  "te puede interesar",
  "hacé click aquí",
  "hacé clic aquí",
  "descargá la app",
  "leé también",
  "copyright",
  "términos y condiciones",
  "todos los derechos reservados",
  "exclusivo para suscriptores",
  "propietario: desarrollos electrónicos",
  "edición nº",
  "registro dnda",
  "mediakit",
  "tarifario"
];

function cleanText(text) {
  if (!text) return null;
  let cleaned = text.trim();
  const lower = cleaned.toLowerCase();
  for (const junk of JUNK_PHRASES) {
    if (lower.includes(junk)) {
      return null;
    }
  }
  return cleaned;
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryParam = searchParams.get('category');
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(limitParam || 20, 1), 100);
    const force = searchParams.get('force') === 'true';
    const autoPublish = searchParams.get('autoPublish') === 'true';

    // 1. Fetch Sitemap
    const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
      headers: BROWSER_HEADERS,
      next: { revalidate: 0 } 
    });
    
    if (!sitemapRes.ok) {
      return NextResponse.json({ 
        success: false, 
        error: `Error al obtener sitemap: HTTP ${sitemapRes.status}` 
      }, { status: 502 });
    }

    const sitemapXml = await sitemapRes.text();
    let $xml = cheerio.load(sitemapXml, { xmlMode: true });
    let urls = [];

    $xml('url').each((i, el) => {
      const loc = $xml(el).find('loc').text().trim();
      const lastmod = $xml(el).find('lastmod').text().trim();
      if (loc) urls.push({ loc, lastmod });
    });

    // If sitemap index, fetch sub-sitemaps
    if (urls.length === 0) {
      const sitemaps = [];
      $xml('sitemap').each((i, el) => {
        const loc = $xml(el).find('loc').text().trim();
        if (loc) sitemaps.push(loc);
      });
      
      if (sitemaps.length > 0) {
        const innerSitemapRes = await fetch(sitemaps[0], { 
          headers: BROWSER_HEADERS,
          next: { revalidate: 0 } 
        });
        if (innerSitemapRes.ok) {
          const innerXml = await innerSitemapRes.text();
          $xml = cheerio.load(innerXml, { xmlMode: true });
          $xml('url').each((i, el) => {
            const loc = $xml(el).find('loc').text().trim();
            const lastmod = $xml(el).find('lastmod').text().trim();
            if (loc) urls.push({ loc, lastmod });
          });
        }
      }
    }

    let filteredUrls = urls;
    
    // Filter by category if specified
    if (categoryParam && categoryParam !== 'todas') {
      filteredUrls = filteredUrls.filter(u => {
        try {
          const pathParts = new URL(u.loc).pathname.split('/').filter(Boolean);
          return pathParts.length > 0 && pathParts[0].toLowerCase() === categoryParam.toLowerCase();
        } catch {
          return false;
        }
      });
    }

    const recentUrls = filteredUrls.slice(0, limit);
    const createdPosts = [];
    const updatedPosts = [];
    const skippedPosts = [];
    const failedPosts = [];

    // Ensure default "Redacción" user exists
    let botUser = await prisma.user.findFirst({ where: { name: 'Redacción' } });
    if (!botUser) {
      botUser = await prisma.user.create({
        data: {
          name: 'Redacción',
          email: 'redaccion@bot.local',
          password: 'NO_LOGIN_POSSIBLE_123',
          role: 'CREATOR',
        }
      });
    }

    for (const item of recentUrls) {
      const url = item.loc;
      const remoteLastMod = item.lastmod ? new Date(item.lastmod) : null;

      // Validate URL format (e.g. https://www.minutouno.com/deportes/titulo-noticia-n12345)
      if (!url.includes('.com/') || url.split('/').length < 4) {
        continue;
      }

      const urlParts = new URL(url).pathname.split('/').filter(Boolean);
      if (urlParts.length < 2) continue;
      
      const rawCategory = urlParts[0];
      let categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      const slug = urlParts[1];

      // Check if post already exists in DB
      const existing = await prisma.post.findUnique({ where: { slug } });
      
      if (existing && !force) {
        if (remoteLastMod && !isNaN(remoteLastMod.getTime())) {
          if (existing.updatedAt >= remoteLastMod) {
            skippedPosts.push({ slug, reason: 'Sin cambios en la fuente' });
            continue;
          }
        } else {
          skippedPosts.push({ slug, reason: 'Ya importado previamente' });
          continue;
        }
      }

      // Fetch the full article HTML
      let articleRes;
      try {
        articleRes = await fetch(url, { 
          headers: BROWSER_HEADERS,
          next: { revalidate: 0 }
        });
      } catch (err) {
        failedPosts.push({ slug, error: `Error de red: ${err.message}` });
        continue;
      }
      
      if (!articleRes.ok) {
        failedPosts.push({ slug, error: `HTTP ${articleRes.status}` });
        continue;
      }

      const articleHtml = await articleRes.text();
      const $ = cheerio.load(articleHtml);

      // Clean unwanted DOM elements before extracting content
      $('.suscription-false, .printed-edition, .m1-interior-nota-interesar, .m1-amb-lo-que-se-lee-ahora, .free-text, .tags, .share-box, .banner, .publicidad, footer, nav, header, script, style, noscript, iframe').remove();

      // Extract Title
      const title = $('meta[property="og:title"]').attr('content') || 
                    $('meta[name="twitter:title"]').attr('content') || 
                    $('h1.title, h1.article-title, h1').first().text().trim() || 
                    $('title').text().trim();

      // Extract Lead / Bajada / Subtitle
      let leadText = $('.excerpt, .bajada, .article-lead, .lead, [itemprop="description"]').first().text().trim() || 
                     $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
      leadText = cleanText(leadText);

      // Extract Cover Image
      let coverImage = $('meta[property="og:image"]').attr('content') || 
                        $('meta[name="twitter:image"]').attr('content') || 
                        $('.gallery-figure img, .main-image img, .article-image img').first().attr('src') || '';
      
      if (coverImage) {
        if (coverImage.startsWith('//')) {
          coverImage = 'https:' + coverImage;
        } else if (coverImage.startsWith('/')) {
          coverImage = 'https://www.minutouno.com' + coverImage;
        }
      }

      // Extract Tags / Keywords
      const rawKeywords = $('meta[name="keywords"]').attr('content') || 
                          $('meta[property="article:tag"]').map((i, el) => $(el).attr('content')).get().join(',') || '';
      const tags = rawKeywords ? rawKeywords.split(',').map(t => t.trim()).filter(Boolean).slice(0, 8).join(', ') : null;

      // Extract Paragraphs & Elements
      const contentElements = [];

      if (leadText && leadText.length > 15) {
        contentElements.push(`<p class="lead font-medium text-lg text-gray-300 mb-4">${leadText}</p>`);
      }

      const extractedParagraphs = [];
      $('.note-body p, .body-content p, .detail-body p, article p').each((i, el) => {
        const raw = $(el).text();
        const cleaned = cleanText(raw);
        if (cleaned && cleaned.length > 20 && cleaned !== leadText && !extractedParagraphs.includes(cleaned)) {
          extractedParagraphs.push(cleaned);
          contentElements.push(`<p class="mb-4 text-gray-200 leading-relaxed">${cleaned}</p>`);
        }
      });

      // Also capture internal high-quality images inside the note body
      $('.note-body img, .body-content img, .detail-body img, article img').each((i, el) => {
        let src = $(el).attr('src') || $(el).attr('data-src') || '';
        if (src && !src.includes('data:image') && !src.includes('logo') && !src.includes('banner')) {
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
          
          if (src !== coverImage && !contentElements.some(c => c.includes(src))) {
            const alt = $(el).attr('alt') || 'Imagen de la noticia';
            contentElements.push(`<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" referrerpolicy="no-referrer" loading="lazy" />`);
          }
        }
      });

      if (contentElements.length === 0 || !title) {
        failedPosts.push({ slug, error: 'Sin contenido legible o sin título' });
        continue;
      }

      const content = contentElements.join('\n');

      // Ensure Category exists
      const categorySlug = rawCategory.toLowerCase();
      let dbCategory = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!dbCategory) {
        dbCategory = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
            isActive: true,
          }
        });
      }

      const postData = {
        title,
        slug,
        content,
        coverImage: coverImage || null,
        category: dbCategory.name,
        tags: tags || undefined,
        authorId: botUser.id,
      };

      if (existing) {
        const updated = await prisma.post.update({
          where: { slug },
          data: {
            ...postData,
            // Keep original isPublished state unless autoPublish is explicitly passed
            isPublished: autoPublish ? true : existing.isPublished
          }
        });
        updatedPosts.push(updated.title);
      } else {
        // ALWAYS create new imported posts as Borrador (isPublished: false) by default
        const created = await prisma.post.create({
          data: {
            ...postData,
            isPublished: autoPublish === true ? true : false
          }
        });
        createdPosts.push(created.title);
      }
    }

    const message = `Completado: ${createdPosts.length} nuevas (como Borrador), ${updatedPosts.length} actualizadas, ${skippedPosts.length} sin cambios, ${failedPosts.length} fallos.`;

    revalidatePath('/admin/posts');
    revalidatePath('/');

    return NextResponse.json({ 
      success: true, 
      message,
      stats: {
        created: createdPosts.length,
        updated: updatedPosts.length,
        skipped: skippedPosts.length,
        failed: failedPosts.length,
      },
      details: { 
        createdPosts, 
        updatedPosts, 
        skippedPosts, 
        failedPosts 
      }
    });
  } catch (error) {
    console.error('Cron Import Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
