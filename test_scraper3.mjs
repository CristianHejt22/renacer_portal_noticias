import * as cheerio from 'cheerio';

async function run() {
  const url = 'https://www.minutouno.com/deportes/gimnasia-gano-el-bosque-y-el-river-chacho-coudet-sumo-su-tercera-derrota-consecutiva-n6304481';
  const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const articleHtml = await articleRes.text();
  const $ = cheerio.load(articleHtml);

  console.log('--- RAW HTML OF ARTICLE ---');
  console.log($('article').html().substring(0, 1500));

  console.log('--- FIND P TAGS ---');
  console.log('In article:', $('article').find('p').length);
  console.log('In specific classes:', $('.article-body, .detail-body, .content, .cuerpo-nota').find('p').length);
  
  // Find where the text actually is
  console.log('--- FINDING TEXT ---');
  const elements = $('body *');
  elements.each((i, el) => {
    if ($(el).text().includes('Eduardo Coudet')) {
       console.log('Found in tag:', el.tagName || el.name, 'class:', $(el).attr('class'));
    }
  });
}

run();
