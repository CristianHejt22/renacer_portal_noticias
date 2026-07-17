'use server';

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function checkIsAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload.role === 'ADMIN';
  } catch (e) {
    return false;
  }
}

export async function getAllUsers() {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) return { success: false, error: 'No autorizado' };

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        credits: true,
        featuredCredits: true,
        freeCreditsExpireAt: true,
        createdAt: true,
      }
    });
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Error al obtener usuarios' };
  }
}

export async function updateUserCredits(userId, { credits, featuredCredits }) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) return { success: false, error: 'No autorizado' };

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        credits: parseInt(credits),
        featuredCredits: parseInt(featuredCredits)
      }
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating user credits:', error);
    return { success: false, error: 'Error al actualizar créditos' };
  }
}

export async function updateUserRole(userId, newRole) {
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) return { success: false, error: 'No autorizado' };

  if (!['USER', 'CREATOR', 'ADMIN'].includes(newRole)) {
    return { success: false, error: 'Rol inválido' };
  }

  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role: newRole }
    });
    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Error al actualizar el rol' };
  }
}
