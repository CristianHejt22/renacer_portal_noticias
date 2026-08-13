import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    const banner = await prisma.bannerAd.findUnique({ where: { id: parseInt(id) }, select: { views: true, targetViews: true } });
    if (banner) {
      const newViews = banner.views + 1;
      const reachedLimit = banner.targetViews && newViews >= banner.targetViews;
      
      await prisma.bannerAd.update({
        where: { id: parseInt(id) },
        data: { 
          views: newViews,
          isActive: reachedLimit ? false : undefined
        }
      });
    }
  } catch (error) {
    // Si la DB falla, solo silenciamos el error para no romper la experiencia de usuario
    console.error('Tracking view error:', error.message);
  }

  // Devolver un pixel transparente o simplemente ok
  return NextResponse.json({ success: true });
}
