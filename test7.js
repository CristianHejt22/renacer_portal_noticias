
const cheerio = require('cheerio');
fetch('https://www.minutouno.com/deportes/los-pumas/vs-all-blacks-hora-formaciones-y-donde-ver-vivo-n6304561', {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}})
  .then(r => r.text())
  .then(html => {
    const $ = cheerio.load(html);
    console.log('--- article text ---');
    console.log($('article').text().substring(0, 200));
    console.log('--- .article-body text ---');
    console.log($('.article-body').text().substring(0, 200));
    console.log('--- .detail-body text ---');
    console.log($('.detail-body').text().substring(0, 200));
    console.log('--- .content text ---');
    console.log($('.content').text().substring(0, 200));
    
    // what classes do they use for content?
    const p_texts = [];
    $('p').each((i, el) => p_texts.push($(el).text()));
    console.log('--- first 5 paragraphs ---');
    console.log(p_texts.slice(0, 5));
    
    // what div wraps the paragraphs?
    console.log('--- parent of first paragraph ---');
    console.log($('p').first().parent().attr('class'));
  });
