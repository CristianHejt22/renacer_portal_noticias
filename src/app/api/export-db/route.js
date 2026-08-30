import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const data = {
      users: await prisma.user.findMany(),
      posts: await prisma.post.findMany(),
      comments: await prisma.comment.findMany(),
      settings: await prisma.setting.findMany(),
      bannerAds: await prisma.bannerAd.findMany(),
      categories: await prisma.category.findMany(),
      classifiedCategories: await prisma.classifiedCategory.findMany(),
      pages: await prisma.page.findMany(),
      classifiedAds: await prisma.classifiedAd.findMany(),
      classifiedReviews: await prisma.classifiedReview.findMany(),
      purchaseRequests: await prisma.purchaseRequest.findMany(),
      promoPopups: await prisma.promoPopup.findMany(),
      savedItems: await prisma.savedItem.findMany(),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="librecielo_backup.json"'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
