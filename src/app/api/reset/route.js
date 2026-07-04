import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: users[0].id },
        data: { password: hashedPassword }
      });
      return NextResponse.json({ 
        mensaje: "¡RESETEO EXITOSO!", 
        tu_correo: users[0].email, 
        nueva_clave: "admin123" 
      });
    } else {
      return NextResponse.json({ error: "No hay usuarios en la base de datos" });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message });
  }
}
