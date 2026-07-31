import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// List of phrases to ignore/filter out
const JUNK_PHRASES = [
  "suscríbete a nuestro newsletter",
  "suscribite a nuestro newsletter",
  "sumate al canal",
  "seguinos en",
  "leé más",
  "te puede interesar",
];

function cleanText(text) {
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
    // 1. Fetch Sitemap
    const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
      headers: BROWSER_HEADERS,
      next: { revalidate: 0 } 
    });
    const sitemapXml = await sitemapRes.text();
    
    // Parse XML
    let $xml = cheerio.load(sitemapXml, { xmlMode: true });
    let urls = [];
    $xml('url loc').each((i, el) => {
      urls.push($xml(el).text());
    });

    const categoryParam = request.nextUrl.searchParams.get('category');

    // If it's a sitemap index, fetch the first sitemap
    if (urls.length === 0) {
      const sitemaps = [];
      $xml('sitemap loc').each((i, el) => {
        sitemaps.push($xml(el).text());
      });
      if (sitemaps.length > 0) {
        const innerSitemapRes = await fetch(sitemaps[0], { 
          headers: BROWSER_HEADERS,
          next: { revalidate: 0 } 
        });
        const innerXml = await innerSitemapRes.text();
        $xml = cheerio.load(innerXml, { xmlMode: true });
        $xml('url loc').each((i, el) => {
          urls.push($xml(el).text());
        });
      }
    }

    let filteredUrls = urls.reverse();
    if (categoryParam && categoryParam !== 'todas') {
      filteredUrls = filteredUrls.filter(u => {
        try {
          const pathParts = new URL(u).pathname.split('/').filter(Boolean);
          return pathParts.length > 0 && pathParts[0].toLowerCase() === categoryParam.toLowerCase();
        } catch {
          return false;
        }
      });
    }

    const recentUrls = filteredUrls.slice(0, 15);
    const successfulPosts = [];
    const skippedPosts = [];
    const failedPosts = [];

    // Ensure "Redacción" user exists
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

    for (const url of recentUrls) {
      // Ignore non-article URLs if any
      if (!url.includes('.com/') || url.split('/').length < 4) continue;

      // Extract slug and category from URL
      // Format: https://www.minutouno.com/deportes/titulo-de-la-noticia-n12345
      const urlParts = new URL(url).pathname.split('/').filter(Boolean);
      if (urlParts.length < 2) continue;
      
      const rawCategory = urlParts[0]; // e.g. "deportes"
      let categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      
      const slug = urlParts[1];

      // Check if post already exists
      const existing = await prisma.post.findUnique({ where: { slug } });
      if (existing && existing.isPublished) {
        continue;
      }

      // Fetch the article
      let articleRes;
      try {
        articleRes = await fetch(url, { headers: BROWSER_HEADERS });
      } catch (err) {
        failedPosts.push(`Fallo red: ${err.message}`);
        continue;
      }
      
      const articleHtml = await articleRes.text();
      const $ = cheerio.load(articleHtml);

      const title = $('meta[property="og:title"]').attr('content') || $('title').text();
      let coverImage = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';
      
      // Fix relative image URLs
      if (coverImage && coverImage.startsWith('/')) {
        coverImage = 'https://www.minutouno.com' + coverImage;
      }
      
      // Extract paragraphs and images inside article
      const paragraphs = [];
      let isPremium = false;
      
      function processElement(el) {
        if (isPremium) return;
        
        if (el.tagName && el.tagName.toLowerCase() === 'img') {
          let src = $(el).attr('src') || $(el).attr('data-src') || '';
          if (src && !src.includes('data:image')) {
            if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
            paragraphs.push(`<img src="${src}" alt="Imagen de la noticia" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" referrerpolicy="no-referrer" />`);
          }
        } else {
          const rawText = $(el).text();
          if (rawText.toLowerCase().includes('exclusivo para suscriptores')) {
            isPremium = true;
            return;
          }
          const text = cleanText(rawText);
          if (text && text.length > 20) {
            paragraphs.push(`<p>${text}</p>`);
          }
        }
      }

      // Combine article AND body searches to ensure we capture images (often in article) and text (often in detail-body)
      $('article').find('p, img').each((i, el) => processElement(el));
      $('.article-body, .detail-body, .content, .cuerpo-nota, [itemprop="articleBody"]').find('p, img').each((i, el) => processElement(el));

      // Deduplicate elements (in case body classes were inside article)
      let uniqueParagraphs = [...new Set(paragraphs)];

      // Ultimate fallback: Just get all P tags and heuristically filter
      if (uniqueParagraphs.filter(p => p.startsWith('<p>')).length === 0 && !isPremium) {
        uniqueParagraphs = []; // Reset array to discard isolated images from header
        $('p, img').each((i, el) => {
          if (isPremium) return;
          
          if (el.tagName && el.tagName.toLowerCase() === 'img') {
             // To prevent scraping icons/logos in ultimate fallback, skip small images or require specific classes. We will just skip imgs in ultimate fallback to be safe, or only take large ones if we could check size. 
             // Safest is to skip img in ultimate fallback.
          } else {
            const rawText = $(el).text();
            if (rawText.toLowerCase().includes('exclusivo para suscriptores')) {
              isPremium = true;
              return;
            }
            const text = cleanText(rawText);
            if (text && text.length > 40 && !text.includes('Copyright') && !text.includes('Términos y condiciones')) {
              uniqueParagraphs.push(`<p>${text}</p>`);
            }
          }
        });
      }

      if (isPremium) {
         skippedPosts.push(`Premium: ${title}`);
         continue;
      }

      if (uniqueParagraphs.length === 0 || !title) {
        failedPosts.push(`Fallo (HTTP ${articleRes.status}): sin contenido o título. HTML size: ${articleHtml.length}`);
        continue;
      }

      const content = uniqueParagraphs.join('\n');

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

      // Prepare post data
      const postData = {
        title,
        slug,
        content,
        coverImage,
        category: dbCategory.name,
        isPublished: false, // Guardado como borrador
        authorId: botUser.id,
      };

      // Save or update post as Draft
      let newPost;
      if (existing) {
        newPost = await prisma.post.update({
          where: { slug },
          data: postData
        });
      } else {
        newPost = await prisma.post.create({
          data: postData
        });
      }

      successfulPosts.push(newPost.title);
    }

    const message = `Éxito: ${successfulPosts.length}. Saltadas: ${skippedPosts.length}. Fallos: ${failedPosts.length}.`;
    
    revalidatePath('/admin/posts');
    revalidatePath('/');

    return NextResponse.json({ 
      success: true, 
      message: message,
      imported: successfulPosts,
      details: { successfulPosts, skippedPosts, failedPosts }
    });
  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
