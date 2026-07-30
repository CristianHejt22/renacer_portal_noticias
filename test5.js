const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

fetch('https://www.minutouno.com/deportes/los-pumas/vs-all-blacks-hora-formaciones-y-donde-ver-vivo-n6304561', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
})
.then(r => r.text())
.then(html => {
  const $ = cheerio.load(html);
  const metas = [];
  $('meta').each((i, e) => {
    const prop = $(e).attr('property') || $(e).attr('name');
    const content = $(e).attr('content');
    if (content && content.includes('http')) {
      metas.push({ prop, content });
    }
  });
  console.log('Metas with http:', metas);
  
  // also check if og:image exists with relative url
  console.log('og:image ->', $('meta[property="og:image"]').attr('content'));
  console.log('twitter:image ->', $('meta[name="twitter:image"]').attr('content'));
  console.log('image_src ->', $('link[rel="image_src"]').attr('href'));
})
.catch(err => console.error(err));
