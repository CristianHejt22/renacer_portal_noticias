import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request, context) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://librecielo.com';

  try {
    const params = await context.params;
    const id = params?.id;
    const numericId = parseInt(id, 10);
    
    if (!numericId) {
      return NextResponse.redirect(`${baseUrl}/noticias`);
    }

    const post = await prisma.post.findUnique({
      where: { id: numericId },
      select: { slug: true }
    });

    if (post) {
      return NextResponse.redirect(`${baseUrl}/noticias/${post.slug}`);
    }
  } catch (error) {
    console.error('Error redirecting news:', error);
  }
  
  return NextResponse.redirect(`${baseUrl}/noticias`);
}
