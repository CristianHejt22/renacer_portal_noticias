'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload; // { userId, role }
  } catch (e) {
    return null;
  }
}

export async function toggleFavorite(type, id) {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, error: 'Debes iniciar sesión para guardar favoritos.' };

    const userId = session.userId;
    const postId = type === 'post' ? parseInt(id) : null;
    const adId = type === 'ad' ? parseInt(id) : null;

    if (!postId && !adId) return { success: false, error: 'ID inválido.' };

    const existing = await prisma.savedItem.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { adId })
      }
    });

    if (existing) {
      await prisma.savedItem.delete({ where: { id: existing.id } });
      revalidatePath('/mi-cuenta/favoritos');
      return { success: true, isFavorited: false };
    } else {
      await prisma.savedItem.create({
        data: {
          userId,
          postId,
          adId
        }
      });
      revalidatePath('/mi-cuenta/favoritos');
      return { success: true, isFavorited: true };
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return { success: false, error: 'Error al procesar la solicitud.' };
  }
}

export async function checkIsFavorite(type, id) {
  try {
    const session = await getUserSession();
    if (!session) return { success: true, isFavorited: false };

    const userId = session.userId;
    const postId = type === 'post' ? parseInt(id) : null;
    const adId = type === 'ad' ? parseInt(id) : null;

    if (!postId && !adId) return { success: true, isFavorited: false };

    const existing = await prisma.savedItem.findFirst({
      where: {
        userId,
        ...(postId ? { postId } : { adId })
      }
    });

    return { success: true, isFavorited: !!existing };
  } catch (error) {
    return { success: true, isFavorited: false };
  }
}

export async function getFavorites() {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, data: [] };

    const favorites = await prisma.savedItem.findMany({
      where: { userId: session.userId },
      include: {
        post: {
          select: { id: true, title: true, slug: true, coverImage: true, category: true, createdAt: true }
        },
        ad: {
          select: { id: true, title: true, slug: true, imageUrl: true, price: true, createdAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: favorites };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { success: false, data: [] };
  }
}
