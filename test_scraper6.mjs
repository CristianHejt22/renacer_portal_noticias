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
  const url = 'https://www.minutouno.com/deportes/gimnasia-gano-el-bosque-y-el-river-chacho-coudet-sumo-su-tercera-derrota-consecutiva-n6304481';
  const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const articleHtml = await articleRes.text();
  const $ = cheerio.load(articleHtml);

  const paragraphs = [];
  let isPremium = false;
  
  function processElement(el) {
    if (isPremium) return;
    
    if (el.tagName && el.tagName.toLowerCase() === 'img') {
      let src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src && !src.includes('data:image')) {
        if (src.startsWith('/')) src = 'https://www.minutouno.com' + src;
        paragraphs.push(`<img src="${src}" />`);
      }
    } else {
      const rawText = $(el).text();
      if (rawText.toLowerCase().includes('exclusivo para suscriptores')) {
        isPremium = true;
        return;
      }
      const text = cleanText(rawText);
      if (text && text.length > 20) {
        paragraphs.push(`<p>${text.substring(0, 40)}...</p>`);
      }
    }
  }

  // Combine article AND body searches
  $('article').find('p, img').each((i, el) => processElement(el));
  $('.article-body, .detail-body, .content, .cuerpo-nota').find('p, img').each((i, el) => processElement(el));

  // Deduplicate
  const uniqueParagraphs = [...new Set(paragraphs)];

  console.log('--- FOUND PARAGRAPHS ---');
  console.log(uniqueParagraphs);
}

run();
