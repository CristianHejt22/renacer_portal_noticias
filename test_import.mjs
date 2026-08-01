import { GET } from './src/app/api/cron/import-minutouno/route.js';

async function run() {
  const req = {
    nextUrl: {
      searchParams: {
        get: (key) => null
      }
    }
  };
  console.log('Starting import...');
  const res = await GET(req);
  console.log('Status:', res.status);
  const json = await res.json();
  console.log('Response:', JSON.stringify(json, null, 2));
}

run().catch(console.error);
