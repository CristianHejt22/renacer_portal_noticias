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
    
    // If logged in as admin/creator, return their posts including drafts
    if (session) {
      let whereClause = {};
      if (session.role === 'CREATOR') {
        whereClause = {
          OR: [
            { authorId: session.userId },
            { author: { name: 'Redacción' } } // Permitir ver los borradores del bot
          ]
        };
      }

      const posts = await prisma.post.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: { author: true },
        take: 100,
      });
      return { success: true, data: posts };
    }

    // If public visitor (no session), return published posts
    const publicPosts = await prisma.post.findMany({
      where: {
        isPublished: true,
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }]
      },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
      take: 100,
    });
    return { success: true, data: publicPosts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, data: [] };
  }
}

export async function getPublicPosts({ category, limit = 100 } = {}) {
  try {
    let where = {
      isPublished: true,
      OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }]
    };

    if (category && category !== 'todas') {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: true },
      take: limit,
    });

    return { success: true, data: posts };
  } catch (error) {
    console.error('Error fetching public posts:', error);
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
      where: { 
        isPublished: true,
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }]
      },
      orderBy: { createdAt: 'desc' },
      take: 7,
    });
    return { success: true, data: posts };
  } catch (error) {
    return { success: false, data: [] };
  }
}

export async function getRecentPosts(limit = 4) {
  try {
    const posts = await prisma.post.findMany({
      where: { 
        isPublished: true,
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }]
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        coverImage: true,
        createdAt: true,
      }
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
        OR: [{ scheduledFor: null }, { scheduledFor: { lte: new Date() } }]
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
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        authorId: session.userId
      }
    });
    revalidatePath('/admin/posts');
    revalidatePath('/noticias');
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
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      }
    });
    revalidatePath('/admin/posts');
    revalidatePath('/noticias');
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

    if (session.role === 'CREATOR') {
      const existing = await prisma.post.findUnique({ where: { id: parseInt(id) } });
      if (!existing || existing.authorId !== session.userId) {
        return { success: false, error: 'No tienes permiso para borrar esta noticia.' };
      }
    }

    await prisma.post.delete({ where: { id: parseInt(id) } });
    revalidatePath('/admin/posts');
    revalidatePath('/noticias');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error eliminando post' };
  }
}

export async function sendPostToMake(id) {
  try {
    const session = await getUserSession();
    if (!session) return { success: false, error: 'No autorizado' };

    const post = await prisma.post.findUnique({ where: { id: parseInt(id) } });
    if (!post) return { success: false, error: 'Noticia no encontrada' };

    const setting = await prisma.setting.findUnique({ where: { key: 'make_webhook_url' } });
    if (!setting || !setting.value) {
      return { success: false, error: 'Debes configurar la URL de Make.com en la sección "Redes Sociales" primero.' };
    }

    const cleanContent = post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';
    
    const siteSetting = await prisma.setting.findUnique({ where: { key: 'site_name' } });
    const siteName = siteSetting ? siteSetting.value : 'Portal de Noticias';

    const payload = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: cleanContent,
      coverImage: post.coverImage,
      coverImageAbsolute: post.coverImage ? `https://librecielo.com${post.coverImage}` : '',
      postUrl: `https://librecielo.com/noticias/${post.slug}`,
      category: post.category,
      tags: post.tags,
      siteName: siteName
    };

    const response = await fetch(setting.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Make.com devolvió error: ${response.statusText}`);
    }

    return { success: true, message: '¡Noticia enviada a Make.com exitosamente!' };
  } catch (error) {
    console.error('Error enviando a Make.com:', error);
    return { success: false, error: error.message || 'Error de conexión con Make.com' };
  }
}
