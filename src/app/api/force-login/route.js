import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function GET(request) {
  try {
    const firstUser = await prisma.user.findFirst({ orderBy: { id: 'asc' } });
    
    if (!firstUser) {
      return NextResponse.json({ success: false, message: 'La base de datos está vacía. No hay usuarios.' });
    }

    // 1. Reset their password to a known one just in case
    const hashedPassword = await bcrypt.hash('renacer2026!', 10);
    await prisma.user.update({
      where: { id: firstUser.id },
      data: { password: hashedPassword, role: 'ADMIN' }
    });

    // 2. Generate a valid session token (30 days)
    const token = await new SignJWT({ userId: firstUser.id, role: 'ADMIN' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(encodedSecret);

    // 3. Set the cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // 4. Redirect them straight into the admin dashboard
    return NextResponse.redirect('https://librecielo.com/admin');
    
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
