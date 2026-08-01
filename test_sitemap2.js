const https = require('https');
https.get('https://www.minutouno.com/sitemap.xml', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    if (data.length > 2000) res.destroy(); // just get enough to see structure
  });
  res.on('close', () => console.log(data.substring(0, 2000)));
});
