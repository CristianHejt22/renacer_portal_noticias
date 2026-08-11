import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    if (users.length === 0) {
      // Find any user if no admin exists
      const anyUser = await prisma.user.findFirst();
      if (!anyUser) {
        return NextResponse.json({ message: 'No users found in database' }, { status: 404 });
      }
      
      const newPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: anyUser.id },
        data: { password: newPassword, role: 'ADMIN' }
      });
      return NextResponse.json({ message: `Password reset to 'admin123' for user: ${anyUser.email}` });
    }

    const admin = users[0];
    const newPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: newPassword }
    });

    return NextResponse.json({ message: `Password reset to 'admin123' for admin: ${admin.email}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
