'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getPages() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: pages };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al obtener páginas' };
  }
}

export async function getPageBySlug(slug) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
    });
    return { success: true, data: page };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al obtener página' };
  }
}

export async function getPageById(id) {
  try {
    const page = await prisma.page.findUnique({
      where: { id: parseInt(id) },
    });
    return { success: true, data: page };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al obtener página' };
  }
}

export async function createPage(data) {
  try {
    const newPage = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished !== undefined ? data.isPublished : false,
      },
    });
    return { success: true, data: newPage };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al crear página. Asegúrate de que el slug sea único.' };
  }
}

export async function updatePage(id, data) {
  try {
    const updatedPage = await prisma.page.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished,
      },
    });
    return { success: true, data: updatedPage };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al actualizar página' };
  }
}

export async function deletePage(id) {
  try {
    await prisma.page.delete({
      where: { id: parseInt(id) },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al eliminar página' };
  }
}
