'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getPopups() {
  try {
    const popups = await prisma.promoPopup.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: popups };
  } catch (error) {
    console.error("Error fetching popups:", error);
    return { success: false, error: 'Error al obtener popups' };
  }
}

export async function getActivePopup() {
  try {
    const popup = await prisma.promoPopup.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    });
    return { success: true, data: popup };
  } catch (error) {
    console.error("Error fetching active popup:", error);
    return { success: false, error: 'Error al obtener popup activo' };
  }
}

export async function savePopup(data) {
  try {
    const { id, title, imageUrl, targetUrl, maxViews, resetPeriod, isActive } = data;

    // Si se activa, desactivar los demás
    if (isActive) {
      await prisma.promoPopup.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    let popup;
    if (id) {
      popup = await prisma.promoPopup.update({
        where: { id: parseInt(id) },
        data: {
          title,
          imageUrl,
          targetUrl,
          maxViews: parseInt(maxViews),
          resetPeriod,
          isActive
        }
      });
    } else {
      popup = await prisma.promoPopup.create({
        data: {
          title,
          imageUrl,
          targetUrl,
          maxViews: parseInt(maxViews),
          resetPeriod,
          isActive
        }
      });
    }

    revalidatePath('/');
    revalidatePath('/admin/popups');
    return { success: true, data: popup };
  } catch (error) {
    console.error("Error saving popup:", error);
    return { success: false, error: 'Error al guardar el popup' };
  }
}

export async function deletePopup(id) {
  try {
    await prisma.promoPopup.delete({
      where: { id: parseInt(id) }
    });
    revalidatePath('/admin/popups');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error deleting popup:", error);
    return { success: false, error: 'Error al eliminar el popup' };
  }
}

export async function togglePopupActive(id, isActive) {
  try {
    if (isActive) {
      await prisma.promoPopup.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const popup = await prisma.promoPopup.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });

    revalidatePath('/');
    revalidatePath('/admin/popups');
    return { success: true, data: popup };
  } catch (error) {
    console.error("Error toggling popup:", error);
    return { success: false, error: 'Error al cambiar estado del popup' };
  }
}
