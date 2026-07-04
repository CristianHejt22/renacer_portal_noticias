import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { data } = body;
    
    // Verificamos si el pago fue exitoso (Status 200 en Mobbex significa aprobado)
    if (data && data.payment && data.payment.status && data.payment.status.code === "200") {
      const reference = data.payment.reference; // Ej: "highlight_user_123_plan_456_time_16238..."
      
      if (!reference) {
        return NextResponse.json({ error: 'Referencia no encontrada' }, { status: 400 });
      }

      const parts = reference.split('_');
      const type = parts[0];       // 'subscription', 'credits' o 'highlight'
      const userId = parseInt(parts[2]);     // ID del usuario
      const targetId = parseInt(parts[4]);   // ID del plan o del post del clasificado

      // LÓGICA AUTOMÁTICA SEGÚN EL TIPO DE COMPRA
      if (type === 'credits') {
        // Sumar créditos a la billetera interna del usuario
        await prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: 10 } } // Sumamos 10 créditos de ejemplo
        });
        console.log(`[Webhook] Créditos cargados exitosamente al usuario ${userId}`);
          
      } else if (type === 'highlight') {
        // El targetId sería el ID del clasificado (ClassifiedAd)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 7); // Destacado por 7 días
          
        await prisma.classifiedAd.update({
          where: { id: targetId },
          data: { 
            isFeatured: true, 
            featuredUntil: expirationDate 
          }
        });
        console.log(`[Webhook] Clasificado ${targetId} destacado con éxito.`);
          
      } else if (type === 'subscription') {
        // Activar suscripción mensual del usuario
        await prisma.user.update({
          where: { id: userId },
          data: { 
            planLevel: 'professional', 
            planActive: true 
          }
        });
        console.log(`[Webhook] Suscripción mensual activada para usuario ${userId}`);
      }

      // Respondemos a Mobbex que recibimos la notificación correctamente
      return new NextResponse('Webhook procesado con éxito', { status: 200 });
    }

    // Si el pago falló o está pendiente, simplemente acusamos recibo sin impactar beneficios
    return new NextResponse('Pago no aprobado o estado no requerido', { status: 200 });

  } catch (error) {
    console.error('Error en Webhook de Mobbex:', error);
    // Devolvemos 500 para que Mobbex reintente el envío más tarde
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
