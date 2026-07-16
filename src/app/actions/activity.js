'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getRecentActivity() {
  try {
    const limit = 4;

    // Get latest published posts
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { title: true, createdAt: true }
    });

    // Get latest classifieds
    const classifieds = await prisma.classifiedAd.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { title: true, createdAt: true }
    });

    // Get latest purchase requests
    const requests = await prisma.purchaseRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { packageName: true, createdAt: true }
    });

    const activity = [];

    posts.forEach(p => activity.push({
      type: 'post',
      text: `Nueva noticia: ${p.title}`,
      date: p.createdAt
    }));

    classifieds.forEach(c => activity.push({
      type: 'classified',
      text: `Nuevo clasificado: ${c.title}`,
      date: c.createdAt
    }));

    requests.forEach(r => activity.push({
      type: 'request',
      text: `Alguien acaba de solicitar un paquete: ${r.packageName}`,
      date: r.createdAt
    }));

    // Sort by most recent
    activity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Return the top 10 most recent across all types
    return { success: true, data: activity.slice(0, 10) };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return { success: false, data: [] };
  }
}
