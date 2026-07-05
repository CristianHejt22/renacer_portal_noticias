'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function getSessionUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload.userId;
  } catch (e) {
    return null;
  }
}

export async function getUserCredits() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, featuredCredits: true }
    });
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: 'Error fetching credits' };
  }
}

// Public: Get all active classifieds
export async function getActiveClassifieds() {
  try {
    const classifieds = await prisma.classifiedAd.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        reviews: true,
        category: true,
      }
    });
    return { success: true, data: classifieds };
  } catch (error) {
    console.error('Error fetching classifieds:', error);
    return { success: false, error: 'Error fetching classifieds' };
  }
}

// Public: Get classified by slug
export async function getClassifiedBySlug(slug) {
  try {
    const classified = await prisma.classifiedAd.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!classified) return { success: false, error: 'Not found' };
    return { success: true, data: classified };
  } catch (error) {
    console.error('Error fetching classified:', error);
    return { success: false, error: 'Error fetching classified' };
  }
}

// Admin: Get all classifieds
export async function getAllClassifieds() {
  try {
    const classifieds = await prisma.classifiedAd.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: classifieds };
  } catch (error) {
    console.error('Error fetching all classifieds:', error);
    return { success: false, error: 'Error fetching all classifieds' };
  }
}

// Admin: Get classified by ID
export async function getClassifiedById(id) {
  try {
    const classified = await prisma.classifiedAd.findUnique({
      where: { id: parseInt(id) }
    });
    if (!classified) return { success: false, error: 'Not found' };
    return { success: true, data: classified };
  } catch (error) {
    console.error('Error fetching classified by ID:', error);
    return { success: false, error: 'Error fetching classified' };
  }
}

// Public/User: Get User Classifieds
export async function getUserClassifieds() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const classifieds = await prisma.classifiedAd.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    });
    return { success: true, data: classifieds };
  } catch (error) {
    console.error('Error fetching user classifieds:', error);
    return { success: false, error: 'Error fetching classifieds' };
  }
}

// Public/User: Publish classified with credits
export async function publishUserClassified(data) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return { success: false, error: 'Unauthorized' };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Check credits based on plan
    const isHighlight = data.plan === 'highlight';
    
    if (user.credits <= 0) {
      return { success: false, error: 'No tienes créditos suficientes para publicar. Por favor compra un paquete.' };
    }
    if (isHighlight && user.featuredCredits <= 0) {
      return { success: false, error: 'No tienes créditos de destacado suficientes. Elige el plan normal o compra más destacados.' };
    }

    const featuredUntil = isHighlight ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

    // Run transaction to ensure credits are deducted when ad is created
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct credits
      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: 1 },
          ...(isHighlight && { featuredCredits: { decrement: 1 } })
        }
      });

      // 2. Create ad
      const newAd = await tx.classifiedAd.create({
        data: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          imageUrl: data.imageUrl,
          price: data.price ? parseFloat(data.price) : null,
          classifiedCategoryId: data.classifiedCategoryId ? parseInt(data.classifiedCategoryId) : null,
          whatsapp: data.whatsapp,
          isActive: true, // Auto publish
          isFeatured: isHighlight,
          featuredUntil: featuredUntil,
          userId: userId,
        }
      });
      return newAd;
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error publishing classified:', error);
    return { success: false, error: 'Error al publicar el clasificado' };
  }
}

// User/Admin: Create classified
export async function createClassified(data) {
  try {
    const newClassified = await prisma.classifiedAd.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        images: data.images || [],
        price: data.price ? parseFloat(data.price) : null,
        classifiedCategoryId: data.classifiedCategoryId ? parseInt(data.classifiedCategoryId) : null,
        whatsapp: data.whatsapp,
        isActive: data.isActive !== undefined ? data.isActive : true,
        userId: data.userId || await getSessionUserId(), // Fallback to current session user
      }
    });
    return { success: true, data: newClassified };
  } catch (error) {
    console.error('Error creating classified:', error);
    return { success: false, error: 'Error creating classified' };
  }
}

// Admin: Update classified
export async function updateClassified(id, data) {
  try {
    const updated = await prisma.classifiedAd.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        images: data.images || [],
        price: data.price ? parseFloat(data.price) : null,
        classifiedCategoryId: data.classifiedCategoryId ? parseInt(data.classifiedCategoryId) : null,
        whatsapp: data.whatsapp,
        isActive: data.isActive,
      }
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating classified:', error);
    return { success: false, error: 'Error updating classified' };
  }
}

// Admin: Delete classified
export async function deleteClassified(id) {
  try {
    await prisma.classifiedAd.delete({
      where: { id: parseInt(id) }
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting classified:', error);
    return { success: false, error: 'Error deleting classified' };
  }
}

// Public: Create review
export async function createReview(data) {
  try {
    const newReview = await prisma.classifiedReview.create({
      data: {
        authorName: data.authorName,
        content: data.content,
        rating: parseInt(data.rating),
        classifiedAdId: parseInt(data.classifiedAdId)
      }
    });
    return { success: true, data: newReview };
  } catch (error) {
    console.error('Error creating review:', error);
    return { success: false, error: 'Error creating review' };
  }
}
