
const cheerio = require('cheerio');
fetch('https://www.minutouno.com/sitemap.xml', {headers: {'User-Agent': 'Mozilla/5.0'}})
  .then(r => r.text())
  .then(xml => {
    const $ = cheerio.load(xml, {xmlMode: true});
    const sitemaps = [];
    $('sitemap loc').each((i, el) => sitemaps.push($(el).text()));
    
    return fetch(sitemaps[0], {headers: {'User-Agent': 'Mozilla/5.0'}});
  })
  .then(r => r.text())
  .then(xml => {
    const $ = cheerio.load(xml, {xmlMode: true});
    const urls = [];
    $('url loc').each((i, el) => urls.push($(el).text()));
    const recent = urls.reverse().slice(0, 3);
    console.log('Recent URLs:', recent);
    
    return fetch(recent[0], {headers: {'User-Agent': 'Mozilla/5.0'}}).then(r => r.text()).then(html => ({url: recent[0], html}));
  })
  .then(({url, html}) => {
    console.log('URL:', url);
    const $ = cheerio.load(html);
    
    console.log('Article length:', $('article').length);
    console.log('Article paragraphs:', $('article p').length);
    console.log('.article-body p length:', $('.article-body p').length);
    console.log('.news-body p length:', $('.news-body p').length);
    console.log('.detail-body p length:', $('.detail-body p').length);
    
    let content = '';
    $('article p').each((i, el) => {
      content += $(el).text() + '\n';
    });
    console.log('Content from article p:', content.substring(0, 200));
  })
  .catch(err => console.error(err));
