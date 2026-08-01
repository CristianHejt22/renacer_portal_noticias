import { NextResponse } from 'next/server';

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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
      headers: BROWSER_HEADERS,
      next: { revalidate: 0 } 
    });
    
    const sitemapStatus = sitemapRes.status;
    const sitemapText = await sitemapRes.text();

    let articleStatus = null;
    let articleHtmlSnippet = null;
    try {
      const articleRes = await fetch('https://www.minutouno.com/sociedad/derrumbe-san-martin-los-andes-dan-conocer-cronograma-circular-la-ruta-40-n6305923', {
        headers: BROWSER_HEADERS,
        next: { revalidate: 0 } 
      });
      articleStatus = articleRes.status;
      const articleText = await articleRes.text();
      articleHtmlSnippet = articleText.substring(0, 500);
    } catch(e) {
      articleStatus = e.message;
    }

    return NextResponse.json({
      sitemap: {
        status: sitemapStatus,
        bodySnippet: sitemapText.substring(0, 500)
      },
      article: {
        status: articleStatus,
        bodySnippet: articleHtmlSnippet
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack });
  }
}
