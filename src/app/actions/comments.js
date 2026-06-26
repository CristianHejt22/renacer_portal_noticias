'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getComments(postId) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: parseInt(postId) },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, data: [] };
  }
}

export async function createComment(postId, authorName, content) {
  try {
    const comment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        authorName,
        content
      }
    });
    revalidatePath(`/noticias/[slug]`, 'page');
    return { success: true, data: comment };
  } catch (error) {
    console.error('Error creating comment:', error);
    return { success: false, error: 'Error al enviar el comentario.' };
  }
}
