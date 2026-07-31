import * as cheerio from 'cheerio';

async function test() {
  const sitemapRes = await fetch('https://www.minutouno.com/sitemap.xml', { 
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const sitemapXml = await sitemapRes.text();
  
  let $xml = cheerio.load(sitemapXml, { xmlMode: true });
  let urls = [];
  $xml('url loc').each((i, el) => {
    urls.push($xml(el).text());
  });

  if (urls.length === 0) {
    const sitemaps = [];
    $xml('sitemap loc').each((i, el) => {
      sitemaps.push($xml(el).text());
    });
    if (sitemaps.length > 0) {
      const innerRes = await fetch(sitemaps[0], { headers: { 'User-Agent': 'Mozilla/5.0' }});
      const innerXml = await innerRes.text();
      $xml = cheerio.load(innerXml, { xmlMode: true });
      $xml('url loc').each((i, el) => {
        urls.push($xml(el).text());
      });
    }
  }

  console.log("Total URLs found:", urls.length);
  const categoryParam = 'espectaculos';
  let filteredUrls = urls.reverse();
  if (categoryParam && categoryParam !== 'todas') {
    filteredUrls = filteredUrls.filter(u => {
      try {
        const pathParts = new URL(u).pathname.split('/').filter(Boolean);
        return pathParts.length > 0 && pathParts[0].toLowerCase() === categoryParam.toLowerCase();
      } catch {
        return false;
      }
    });
  }

  console.log("Filtered URLs:", filteredUrls.length);
  console.log(filteredUrls.slice(0, 5));
}

test();
