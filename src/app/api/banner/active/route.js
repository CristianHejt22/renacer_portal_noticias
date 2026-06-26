import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const position = searchParams.get('position') || 'in-article';

  try {
    const banners = await prisma.bannerAd.findMany({
      where: { 
        isActive: true,
        position: position
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    // Retornamos un array vacío si la DB falla
    return NextResponse.json({ success: false, data: [] });
  }
}
