import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const url = searchParams.get('url');

  if (!url) return NextResponse.redirect(new URL('/', request.url));

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

  // Redirigir siempre a la URL destino
  return NextResponse.redirect(url);
}
