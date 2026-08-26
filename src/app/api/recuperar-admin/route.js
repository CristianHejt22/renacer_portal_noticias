import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const firstUser = await prisma.user.findFirst({ orderBy: { id: 'asc' } });
    
    if (firstUser) {
      await prisma.user.update({
        where: { id: firstUser.id },
        data: { password: hashedPassword, role: 'ADMIN' }
      });
      return NextResponse.json({ 
        success: true, 
        message: '¡ÉXITO! La contraseña de tu cuenta administradora ha sido restablecida a: admin123 . Por favor, ve a /login e inicia sesión con tu correo y esta nueva clave. Luego, ve inmediatamente a Configuración General para cambiarla a una segura.' 
      });
    }
    
    return NextResponse.json({ success: false, message: 'No hay usuarios en la base de datos.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
