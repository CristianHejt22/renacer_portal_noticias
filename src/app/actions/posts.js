'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

async function ensureUserExists() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'admin@renacer.com',
        password: 'password', // in a real app this would be hashed
        name: 'Redacción Renacer'
      }
    });
  }
  return user;
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true }
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
    const user = await ensureUserExists();
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
        authorId: user.id
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
    await prisma.post.delete({ where: { id: parseInt(id) } });
    revalidatePath('/admin/posts');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error eliminando post' };
  }
}
