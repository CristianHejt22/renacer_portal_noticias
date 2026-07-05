'use server';

import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

async function getSession() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function createPurchaseRequest(data) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado' };
    }

    const request = await prisma.purchaseRequest.create({
      data: {
        userId: session.userId,
        packageId: data.packageId,
        packageName: data.packageName,
        amount: data.amount
      }
    });

    return { success: true, data: request };
  } catch (error) {
    console.error('Error creating purchase request:', error);
    return { success: false, error: 'Error al procesar la solicitud' };
  }
}

export async function getPendingPurchaseRequests() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' };
    }

    const requests = await prisma.purchaseRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error('Error fetching purchase requests:', error);
    return { success: false, error: 'Error al obtener solicitudes' };
  }
}

export async function approvePurchaseRequest(requestId) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' };
    }

    // Usar una transacción para actualizar la solicitud y los créditos del usuario
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.purchaseRequest.findUnique({ where: { id: requestId } });
      if (!request || request.status !== 'PENDING') {
        throw new Error('Solicitud inválida o ya procesada');
      }

      await tx.purchaseRequest.update({
        where: { id: requestId },
        data: { status: 'APPROVED' }
      });

      // Calcular créditos (Basado en la lógica anterior del paquete)
      // Ejemplo: paquete "pymes_50" = 50 créditos comunes, 10 destacados.
      let extraCredits = 0;
      let extraFeatured = 0;

      if (request.packageId === 'credito_individual') {
         extraCredits = 1;
      } else if (request.packageId === 'destacado_individual') {
         extraFeatured = 1;
      } else if (request.packageId === 'pymes_50') {
         extraCredits = 50;
         extraFeatured = 10;
      } else if (request.packageId === 'pymes_100') {
         extraCredits = 100;
         extraFeatured = 20;
      }

      await tx.user.update({
        where: { id: request.userId },
        data: {
          credits: { increment: extraCredits },
          featuredCredits: { increment: extraFeatured }
        }
      });

      return true;
    });

    return { success: true };
  } catch (error) {
    console.error('Error approving request:', error);
    return { success: false, error: error.message || 'Error interno' };
  }
}

export async function rejectPurchaseRequest(requestId) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'No autorizado' };
    }

    await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' }
    });

    return { success: true };
  } catch (error) {
    console.error('Error rejecting request:', error);
    return { success: false, error: 'Error al rechazar' };
  }
}
