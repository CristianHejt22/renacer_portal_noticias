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
  const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const sitemapXml = await sitemapRes.text();
  let $xml = cheerio.load(sitemapXml, { xmlMode: true });
  let urls = [];
  $xml('url loc').each((i, el) => urls.push($xml(el).text()));

  if (urls.length === 0) {
    const sitemaps = [];
    $xml('sitemap loc').each((i, el) => sitemaps.push($xml(el).text()));
    if (sitemaps.length > 0) {
      const innerSitemapRes = await fetch(sitemaps[0], { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const innerXml = await innerSitemapRes.text();
      $xml = cheerio.load(innerXml, { xmlMode: true });
      $xml('url loc').each((i, el) => urls.push($xml(el).text()));
    }
  }

  const recentUrls = urls.reverse().slice(0, 5);
  
  for (const url of recentUrls) {
    if (!url.includes('.com/') || url.split('/').length < 4) continue;
    console.log('\n--- TESTING URL:', url);
    const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const articleHtml = await articleRes.text();
    const $ = cheerio.load(articleHtml);

    const paragraphs = [];
    let isPremium = false;
    
    function processElement(el) {
      if (isPremium) return;
      if (el.tagName && el.tagName.toLowerCase() === 'img') {
        paragraphs.push(`IMG`);
      } else {
        const rawText = $(el).text();
        if (rawText.toLowerCase().includes('exclusivo para suscriptores')) {
          isPremium = true;
          return;
        }
        const text = cleanText(rawText);
        if (text && text.length > 20) {
          paragraphs.push(`TEXT: ${text.substring(0, 30)}...`);
        }
      }
    }

    $('article').find('p, img').each((i, el) => processElement(el));
    $('.article-body, .detail-body, .content, .cuerpo-nota, [itemprop="articleBody"]').find('p, img').each((i, el) => processElement(el));

    let uniqueParagraphs = [...new Set(paragraphs)];
    
    if (uniqueParagraphs.filter(p => p.startsWith('TEXT')).length === 0 && !isPremium) {
      uniqueParagraphs = [];
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
            uniqueParagraphs.push(`TEXT_FALLBACK: ${text.substring(0, 30)}...`);
          }
        }
      });
    }

    console.log('EXTRACTED PARAGRAPHS:', uniqueParagraphs);
  }
}

run();
