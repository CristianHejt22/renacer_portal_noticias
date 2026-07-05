import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    
    // Prevent abuse: very basic logic to increment views
    // In a more complex app we could check cookies or IP to prevent multiple views from the same user, but for now we'll just increment it.
    await prisma.classifiedAd.update({
      where: { id: parseInt(id) },
      data: { clicks: { increment: 1 } }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
