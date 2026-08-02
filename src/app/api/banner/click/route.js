import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const rawUrl = searchParams.get('url');

  if (id) {
    try {
      await prisma.bannerAd.update({
        where: { id: parseInt(id) },
        data: { clicks: { increment: 1 } }
      });
    } catch (error) {
      console.error('Tracking click error:', error.message);
    }
  }

  let destination = rawUrl ? decodeURIComponent(rawUrl).trim() : '';

  if (!destination || destination === 'undefined' || destination === 'null' || destination === '#') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    if (destination.startsWith('/')) {
      return NextResponse.redirect(new URL(destination, request.url));
    } else {
      destination = 'https://' + destination;
    }
  }

  try {
    return NextResponse.redirect(new URL(destination));
  } catch (e) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
