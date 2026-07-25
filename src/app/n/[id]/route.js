import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params?.id;
    const numericId = parseInt(id, 10);
    
    if (!numericId) {
      return NextResponse.redirect(new URL('/noticias', request.url));
    }

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
