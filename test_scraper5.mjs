import * as cheerio from 'cheerio';

async function run() {
  const url = 'https://www.minutouno.com/deportes/gimnasia-gano-el-bosque-y-el-river-chacho-coudet-sumo-su-tercera-derrota-consecutiva-n6304481';
  const articleRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const articleHtml = await articleRes.text();
  const $ = cheerio.load(articleHtml);

  console.log('Is detail-body inside article?', $('article .detail-body').length > 0);
  console.log('Is detail-body inside body?', $('body .detail-body').length > 0);
  
}

run();
