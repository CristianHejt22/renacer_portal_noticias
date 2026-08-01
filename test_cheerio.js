const cheerio = require('cheerio');

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'es-AR,es;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
};

async function test() {
  const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { headers: BROWSER_HEADERS });
  const sitemapXml = await sitemapRes.text();
  
  let $xml = cheerio.load(sitemapXml, { xmlMode: true });
  console.log('url count:', $xml('url').length);
  console.log('sitemap count:', $xml('sitemap').length);
  console.log('url loc count:', $xml('url loc').length);
  
  const urls = [];
  $xml('url').each((i, el) => {
    const loc = $xml(el).find('loc').text();
    const lastmod = $xml(el).find('lastmod').text();
    urls.push({ loc, lastmod });
  });

  console.log('urls length:', urls.length);
  if (urls.length > 0) {
    console.log('first parsed url:', urls[0]);
  }
}
test();
