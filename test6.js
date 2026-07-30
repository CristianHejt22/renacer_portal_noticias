
const cheerio = require('cheerio');
fetch('https://www.minutouno.com/deportes/los-pumas/vs-all-blacks-hora-formaciones-y-donde-ver-vivo-n6304561', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log('og:image=', $('meta[property="og:image"]').attr('content'));
    console.log('twitter:image=', $('meta[name="twitter:image"]').attr('content'));
    console.log('image_src=', $('link[rel="image_src"]').attr('href'));
    const allImgs = [];
    $('img').each((i, el) => allImgs.push($(el).attr('src')));
    console.log('first 5 images=', allImgs.slice(0, 5));
  });
