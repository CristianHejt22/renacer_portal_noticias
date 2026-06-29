import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  try {
    await prisma.bannerAd.update({
      where: { id: parseInt(id) },
      data: { views: 0, clicks: 0 }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reset metrics error:', error.message);
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
