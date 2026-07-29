import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

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

export async function GET(request) {
  try {
    // 1. Fetch Sitemap
    const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
      next: { revalidate: 0 } 
    });
    const sitemapXml = await sitemapRes.text();
    
    // Parse XML
    let $xml = cheerio.load(sitemapXml, { xmlMode: true });
    let urls = [];
    $xml('url loc').each((i, el) => {
      urls.push($xml(el).text());
    });

    // If it's a sitemap index, fetch the first sitemap
    if (urls.length === 0) {
      const sitemaps = [];
      $xml('sitemap loc').each((i, el) => {
        sitemaps.push($xml(el).text());
      });
      if (sitemaps.length > 0) {
        const innerSitemapRes = await fetch(sitemaps[0], { 
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
          next: { revalidate: 0 } 
        });
        const innerXml = await innerSitemapRes.text();
        $xml = cheerio.load(innerXml, { xmlMode: true });
        $xml('url loc').each((i, el) => {
          urls.push($xml(el).text());
        });
      }
    }

    // Get the most recent 15 urls
    const recentUrls = urls.reverse().slice(0, 15);
    const addedPosts = [];

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
      if (existing) continue;

      // Fetch the article
      const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
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
        
        if (el.tagName.toLowerCase() === 'img') {
          let src = $(el).attr('src') || $(el).attr('data-src') || '';
          if (src && !src.includes('data:image')) {
            if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
            paragraphs.push(`<img src="${src}" alt="Imagen de la noticia" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />`);
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

      $('article').find('p, img').each((i, el) => processElement(el));
      
      // Fallback if no <article> tag is found
      if (paragraphs.length === 0) {
        $('.article-body, .detail-body, .content').find('p, img').each((i, el) => processElement(el));
      }

      // Ultimate fallback: Just get all P tags and heuristically filter
      if (paragraphs.length === 0 && !isPremium) {
        $('p, img').each((i, el) => {
          if (isPremium) return;
          
          if (el.tagName.toLowerCase() === 'img') {
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
              paragraphs.push(`<p>${text}</p>`);
            }
          }
        });
      }

      if (isPremium) {
         addedPosts.push(`Omitido (Premium): ${title}`);
         continue;
      }

      if (paragraphs.length === 0 || !title) {
        addedPosts.push(`Fallo al extraer contenido o título para: ${url}. Title: ${title}, P count: ${paragraphs.length}`);
        continue;
      }

      const content = paragraphs.join('\n');

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

      // Save post as Draft
      const newPost = await prisma.post.create({
        data: {
          title,
          slug,
          content,
          coverImage,
          category: dbCategory.name,
          isPublished: false, // Guardado como borrador
          authorId: botUser.id,
        }
      });

      addedPosts.push(newPost.title);
    }

    return NextResponse.json({ 
      success: true, 
      message: addedPosts.length > 0 ? `Importadas ${addedPosts.length} noticias.` : 'No hay noticias nuevas.',
      imported: addedPosts 
    });
  } catch (error) {
    console.error('Import Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
