'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
      orderBy: { order: 'asc' },
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al obtener categorías' };
  }
}

export async function createCategory(data) {
  try {
    const newCategory = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        order: parseInt(data.order) || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        parentId: data.parentId ? parseInt(data.parentId) : null,
      },
    });
    return { success: true, data: newCategory };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al crear categoría' };
  }
}

export async function updateCategory(id, data) {
  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        slug: data.slug,
        order: parseInt(data.order),
        isActive: data.isActive,
        parentId: data.parentId ? parseInt(data.parentId) : null,
      },
    });
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al actualizar categoría' };
  }
}

export async function deleteCategory(id) {
  try {
    await prisma.category.delete({
      where: { id: parseInt(id) },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al eliminar categoría' };
  }
}
