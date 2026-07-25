import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  
  if (!numericId) {
    return NextResponse.redirect(new URL('/clasificados', request.url));
  }

  try {
    const ad = await prisma.classifiedAd.findUnique({
      where: { id: numericId },
      select: { slug: true }
    });

    if (ad) {
      return NextResponse.redirect(new URL(`/clasificados/${ad.slug}`, request.url));
    }
  } catch (error) {
    console.error('Error redirecting classified:', error);
  }
  
  return NextResponse.redirect(new URL('/clasificados', request.url));
}
