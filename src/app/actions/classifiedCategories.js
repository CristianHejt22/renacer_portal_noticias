'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getClassifiedCategories() {
  try {
    const categories = await prisma.classifiedCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        parent: true,
        children: true,
      }
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al obtener categorías de clasificados' };
  }
}

export async function createClassifiedCategory(data) {
  try {
    const newCategory = await prisma.classifiedCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        order: parseInt(data.order) || 0,
        parentId: data.parentId ? parseInt(data.parentId) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    return { success: true, data: newCategory };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al crear categoría de clasificado' };
  }
}

export async function updateClassifiedCategory(id, data) {
  try {
    const updatedCategory = await prisma.classifiedCategory.update({
      where: { id: parseInt(id) },
      data: {
        name: data.name,
        slug: data.slug,
        order: parseInt(data.order),
        parentId: data.parentId ? parseInt(data.parentId) : null,
        isActive: data.isActive,
      },
    });
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al actualizar categoría de clasificado' };
  }
}

export async function deleteClassifiedCategory(id) {
  try {
    await prisma.classifiedCategory.delete({
      where: { id: parseInt(id) },
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Error al eliminar categoría de clasificado' };
  }
}
