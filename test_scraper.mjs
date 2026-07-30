import * as cheerio from 'cheerio';

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

async function run() {
  console.log('Fetching sitemap...');
  const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const sitemapXml = await sitemapRes.text();
  let $xml = cheerio.load(sitemapXml, { xmlMode: true });
  let urls = [];
  $xml('url loc').each((i, el) => {
    urls.push($xml(el).text());
  });

  if (urls.length === 0) {
    console.log('Sitemap is an index. Fetching inner sitemap...');
    const sitemaps = [];
    $xml('sitemap loc').each((i, el) => {
      sitemaps.push($xml(el).text());
    });
    if (sitemaps.length > 0) {
      const innerRes = await fetch(sitemaps[0], { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const innerXml = await innerRes.text();
      $xml = cheerio.load(innerXml, { xmlMode: true });
      $xml('url loc').each((i, el) => {
        urls.push($xml(el).text());
      });
    }
  }

  const recentUrls = urls.reverse().slice(0, 3); // Test 3 URLs
  
  for (const url of recentUrls) {
    console.log('\n================================');
    console.log('TESTING URL:', url);
    const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
    const articleHtml = await articleRes.text();
    const $ = cheerio.load(articleHtml);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text();
    console.log('TITLE:', title);

    const paragraphs = [];
    let isPremium = false;
    
    function processElement(el) {
      if (isPremium) return;
      
      if (el.tagName && el.tagName.toLowerCase() === 'img') {
        let src = $(el).attr('src') || $(el).attr('data-src') || '';
        if (src && !src.includes('data:image')) {
          if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
          paragraphs.push(`<img src="${src}" class="rounded-xl w-full my-4" alt="Imagen de la noticia" referrerpolicy="no-referrer" />`);
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
    console.log('Paragraphs found in <article>:', paragraphs.length);
    
    if (paragraphs.length === 0) {
      $('.article-body, .detail-body, .content').find('p, img').each((i, el) => processElement(el));
      console.log('Paragraphs found after fallback 1:', paragraphs.length);
    }

    if (paragraphs.length === 0 && !isPremium) {
      $('p, img').each((i, el) => {
        if (isPremium) return;
        
        if (el.tagName && el.tagName.toLowerCase() === 'img') {
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
      console.log('Paragraphs found after ultimate fallback:', paragraphs.length);
    }

    if (paragraphs.length > 0) {
      console.log('--- SAMPLE CONTENT ---');
      console.log(paragraphs.join('\n').substring(0, 500) + '...');
    } else {
      console.log('--- NO CONTENT EXTRACTED ---');
    }
  }
}

run();
