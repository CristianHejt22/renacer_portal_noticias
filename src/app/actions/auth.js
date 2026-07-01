'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function checkHasUsers() {
  try {
    const count = await prisma.user.count();
    return { success: true, hasUsers: count > 0 };
  } catch (error) {
    console.error('Error checking users:', error);
    return { success: false, error: 'Database error' };
  }
}

export async function createFirstAdmin(email, password) {
  try {
    const count = await prisma.user.count();
    if (count > 0) {
      return { success: false, error: 'El administrador ya existe.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Administrador',
      },
    });

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Ocurrió un error al crear el administrador' };
  }
}

export async function login(email, password) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { success: false, error: 'Credenciales inválidas' };
    }

    await createSession(user.id);
    return { success: true };
  } catch (error) {
    console.error('Error in login:', error);
    return { success: false, error: 'Ocurrió un error al intentar iniciar sesión' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}

async function createSession(userId) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(encodedSecret);

  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
