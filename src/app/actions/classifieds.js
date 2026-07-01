'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Admin: Create classified
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
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        whatsapp: data.whatsapp,
        isActive: data.isActive !== undefined ? data.isActive : true,
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
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
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
