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

export async function getPosts() {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, data: [] };

    // Si es CREATOR, solo ve sus propias noticias
    const whereClause = session.role === 'CREATOR' ? { authorId: session.userId } : {};

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { author: true },
      take: 50, // Límite de seguridad
    });
    return { success: true, data: posts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, data: [] };
  }
}

export async function getPost(id) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) }
    });
    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: 'Error fetching post' };
  }
}

export async function getPostBySlug(slug) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: true }
    });
    return { success: true, data: post };
  } catch (error) {
    return { success: false, error: 'Error fetching post' };
  }
}

export async function getHomePosts() {
  try {
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 7,
      // We don't use select here because we need the content for the hero snippet, 
      // but taking only 7 is thousands of times faster than fetching all posts.
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function getRecentPosts(limit = 4) {
  try {
    const posts = await prisma.post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        coverImage: true,
        createdAt: true,
      } // Exclude heavy content!
    });
    return { success: true, data: posts };
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return { success: false, data: [] };
  }
}

export async function getRelatedPosts(category, currentPostId) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        category: category,
        isPublished: true,
        id: { not: parseInt(currentPostId) },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    return { success: true, data: posts };
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return { success: false, data: [] };
  }
}

export async function createPost(data) {
  try {
    const session = await getUserSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'CREATOR')) {
      return { success: false, error: 'No tienes permiso para crear noticias.' };
    }

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        sponsorId: data.sponsorId ? parseInt(data.sponsorId) : null,
        isPublished: data.isPublished,
        authorId: session.userId
      }
    });
    revalidatePath('/admin/posts');
    revalidatePath('/');
    return { success: true, data: post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Error al crear la noticia. Verifica si el slug ya existe.' };
  }
}

export async function updatePost(id, data) {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, error: 'No autorizado' };

    // Si es CREATOR, verificar que sea el dueño
    if (session.role === 'CREATOR') {
      const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
      if (!existing || existing.authorId !== session.userId) {
        return { success: false, error: 'No tienes permiso para editar esta noticia.' };
      }
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        sponsorId: data.sponsorId ? parseInt(data.sponsorId) : null,
        isPublished: data.isPublished,
      }
    });
    revalidatePath('/admin/posts');
    revalidatePath('/');
    revalidatePath(`/noticias/${post.slug}`);
    return { success: true, data: post };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Error al actualizar la noticia.' };
  }
}

export async function deletePost(id) {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, error: 'No autorizado' };

    // Si es CREATOR, verificar que sea el dueño
    if (session.role === 'CREATOR') {
      const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
      if (!existing || existing.authorId !== session.userId) {
        return { success: false, error: 'No tienes permiso para borrar esta noticia.' };
      }
    }

    await prisma.post.delete({ where: { id: parseInt(id) } });
    revalidatePath('/admin/posts');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error eliminando post' };
  }
}
