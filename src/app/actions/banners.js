'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getBanners() {
  try {
    const banners = await prisma.bannerAd.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: banners };
  } catch (error) {
    console.error('Error fetching banners:', error);
    // Retornamos un mock si la DB falla para que la app no explote
    return { 
      success: false, 
      data: [
        {
          id: 1,
          name: "Ejemplo de Banner (DB desconectada)",
          imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
          targetUrl: "https://ejemplo.com",
          views: 1250,
          clicks: 45,
          isActive: true
        }
      ] 
    };
  }
}

export async function createBanner(data) {
  try {
    const banner = await prisma.bannerAd.create({
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        position: data.position || 'in-article',
        isActive: true,
      }
    });
    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error creating banner:', error);
    return { success: false, error: 'Database connection error.' };
  }
}

export async function updateBanner(id, data) {
  try {
    const banner = await prisma.bannerAd.update({
      where: { id },
      data: {
        name: data.name,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        position: data.position,
      }
    });
    revalidatePath('/admin/banners');
    revalidatePath('/');
    return { success: true, data: banner };
  } catch (error) {
    console.error('Error updating banner:', error);
    return { success: false, error: 'Error actualizando banner' };
  }
}

export async function toggleBannerStatus(id, currentStatus) {
  try {
    await prisma.bannerAd.update({
      where: { id },
      data: { isActive: !currentStatus }
    });
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error actualizando banner' };
  }
}

export async function deleteBanner(id) {
  try {
    await prisma.bannerAd.delete({ where: { id } });
    revalidatePath('/admin/banners');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error eliminando banner' };
  }
}
