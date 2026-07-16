import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Destructure params safely for Next.js 15+
    const resolvedParams = await params;
    const filename = resolvedParams.filename;
    
    // Images are stored in public/uploads
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    if (!fs.existsSync(filepath)) {
      return new NextResponse('Not Found', { status: 404 });
    }
    
    const fileBuffer = fs.readFileSync(filepath);
    
    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
