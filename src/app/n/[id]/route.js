import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  
  if (!numericId) {
    return NextResponse.redirect(new URL('/noticias', request.url));
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: numericId },
      select: { slug: true }
    });

    if (post) {
      return NextResponse.redirect(new URL(`/noticias/${post.slug}`, request.url));
    }
  } catch (error) {
    console.error('Error redirecting news:', error);
  }
  
  return NextResponse.redirect(new URL('/noticias', request.url));
}
