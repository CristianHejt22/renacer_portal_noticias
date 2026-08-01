import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow longer execution time on Vercel Pro/hobby

const prisma = new PrismaClient();

// List of phrases to ignore/filter out in paragraph text
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
  "exclusivo para suscriptores"
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

    // MinutoUno lists from newest to oldest or vice versa; ensure we have the newest first
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

      // Validate URL format
      if (!url.includes('.com/') || url.split('/').length < 4) {
        continue;
      }

      const urlParts = new URL(url).pathname.split('/').filter(Boolean);
      if (urlParts.length < 2) continue;
      
      const rawCategory = urlParts[0]; // e.g. "deportes"
      let categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      const slug = urlParts[1];

      // Check if post already exists in DB
      const existing = await prisma.post.findUnique({ where: { slug } });
      
      if (existing && !force) {
        // If existing and we have a lastmod timestamp, verify if remote is newer
        if (remoteLastMod && !isNaN(remoteLastMod.getTime())) {
          if (existing.updatedAt >= remoteLastMod) {
            skippedPosts.push({ slug, reason: 'Sin cambios en la fuente' });
            continue;
          }
        } else {
          // If no remote timestamp, skip to avoid redundant scraping
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

      // Extract Title
      const title = $('meta[property="og:title"]').attr('content') || 
                    $('meta[name="twitter:title"]').attr('content') || 
                    $('h1.title, h1.article-title, h1').first().text().trim() || 
                    $('title').text().trim();

      // Extract Lead / Bajada / Subtitle
      let leadText = $('h2.bajada, .article-lead, .lead, [itemprop="description"]').first().text().trim() || 
                     $('meta[property="og:description"]').attr('content') || 
                     $('meta[name="description"]').attr('content') || '';
      leadText = cleanText(leadText);

      // Extract Cover Image
      let coverImage = $('meta[property="og:image"]').attr('content') || 
                        $('meta[name="twitter:image"]').attr('content') || 
                        $('.main-image img, .article-image img, [itemprop="image"]').first().attr('src') || '';
      
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

      // Extract Content & Structure
      const contentElements = [];
      let isPremium = false;

      if (leadText && leadText.length > 20) {
        contentElements.push(`<p class="lead font-medium text-lg text-gray-300 mb-4">${leadText}</p>`);
      }

      function processElement(el) {
        if (isPremium) return;
        const tagName = el.tagName ? el.tagName.toLowerCase() : '';
        
        if (tagName === 'img') {
          let src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-original') || '';
          if (src && !src.includes('data:image')) {
            if (src.startsWith('//')) src = 'https:' + src;
            else if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
            const alt = $(el).attr('alt') || 'Imagen de la noticia';
            contentElements.push(`<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" referrerpolicy="no-referrer" loading="lazy" />`);
          }
        } else if (tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
          const headingText = cleanText($(el).text());
          if (headingText && headingText.length > 5 && headingText !== title) {
            contentElements.push(`<h3 class="text-xl font-bold mt-6 mb-3 text-white">${headingText}</h3>`);
          }
        } else if (tagName === 'blockquote') {
          const quoteText = cleanText($(el).text());
          if (quoteText && quoteText.length > 10) {
            contentElements.push(`<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-gray-300">${quoteText}</blockquote>`);
          }
        } else {
          const rawText = $(el).text();
          if (rawText.toLowerCase().includes('exclusivo para suscriptores')) {
            isPremium = true;
            return;
          }
          const text = cleanText(rawText);
          if (text && text.length > 20 && !contentElements.some(c => c.includes(text))) {
            contentElements.push(`<p class="mb-4 text-gray-200 leading-relaxed">${text}</p>`);
          }
        }
      }

      // Search in standard article content containers
      $('article, .article-body, .detail-body, .content, .cuerpo-nota, [itemprop="articleBody"]')
        .find('p, img, h2, h3, h4, blockquote')
        .each((i, el) => processElement(el));

      // Fallback if no paragraphs were gathered
      if (contentElements.filter(el => el.startsWith('<p')).length === 0 && !isPremium) {
        $('p').each((i, el) => {
          if (isPremium) return;
          const rawText = $(el).text();
          const text = cleanText(rawText);
          if (text && text.length > 40 && !contentElements.some(c => c.includes(text))) {
            contentElements.push(`<p class="mb-4 text-gray-200 leading-relaxed">${text}</p>`);
          }
        });
      }

      if (isPremium) {
        skippedPosts.push({ slug, reason: 'Contenido exclusivo para suscriptores' });
        continue;
      }

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
            // Keep original publication status unless autoPublish is explicitly forced
            isPublished: autoPublish ? true : existing.isPublished
          }
        });
        updatedPosts.push(updated.title);
      } else {
        const created = await prisma.post.create({
          data: {
            ...postData,
            isPublished: autoPublish ? true : false
          }
        });
        createdPosts.push(created.title);
      }
    }

    const message = `Completado: ${createdPosts.length} nuevas, ${updatedPosts.length} actualizadas, ${skippedPosts.length} sin cambios, ${failedPosts.length} fallos.`;

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
