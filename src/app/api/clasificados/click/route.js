import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.redirect(new URL('/clasificados', request.url));
  }

  try {
    // Buscar el clasificado y aumentar sus clicks en 1
    const ad = await prisma.classifiedAd.update({
      where: { id: parseInt(id) },
      data: {
        clicks: { increment: 1 }
      }
    });

    // Generar la URL de WhatsApp
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const adUrl = `${baseUrl}/clasificados/${ad.slug}`;
    const message = `Hola, vi tu anuncio "${ad.title}" en THE DINNER Portal: ${adUrl}`;
    
    // Limpiar el número de WhatsApp
    const cleanNumber = ad.whatsapp.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.redirect(whatsappUrl);
  } catch (error) {
    console.error('Error in classified click:', error);
    return NextResponse.redirect(new URL('/clasificados', request.url));
  }
}
