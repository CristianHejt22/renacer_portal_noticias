import * as cheerio from 'cheerio';

async function run() {
  const url = 'https://www.minutouno.com/deportes/gimnasia-gano-el-bosque-y-el-river-chacho-coudet-sumo-su-tercera-derrota-consecutiva-n6304481';
  const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const articleHtml = await articleRes.text();
  const $ = cheerio.load(articleHtml);

  const paragraphs = [];
  
  function processElement(el) {
    if (el.tagName && el.tagName.toLowerCase() === 'img') {
      paragraphs.push('IMG: ' + $(el).attr('src'));
    } else {
      const text = $(el).text().trim();
      if (text.length > 20) {
        paragraphs.push('P: ' + text.substring(0, 40) + '...');
      }
    }
  }

  $('article').find('p, img').each((i, el) => processElement(el));
  console.log('--- FOUND IN <article> ---');
  console.log(paragraphs);

  if (paragraphs.length === 0) {
    $('.article-body, .detail-body, .content, .cuerpo-nota, [itemprop="articleBody"]').find('p, img').each((i, el) => processElement(el));
    console.log('--- FOUND IN fallback 1 ---');
    console.log(paragraphs);
  }
}

run();
