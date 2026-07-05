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
    const users = await prisma.user.findMany();
    // Consider we have "real" users only if at least one has a bcrypt hashed password
    const hasRealUsers = users.some(u => u.password.startsWith('$2'));
    return { success: true, hasUsers: hasRealUsers };
  } catch (error) {
    console.error('Error checking users:', error);
    return { success: false, error: 'Database error' };
  }
}

export async function createFirstAdmin(email, password) {
  try {
    const users = await prisma.user.findMany();
    const hasRealUsers = users.some(u => u.password.startsWith('$2'));
    
    if (hasRealUsers) {
      return { success: false, error: 'El administrador ya existe.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let user;
    if (users.length > 0) {
      // Overwrite the first dummy user (to preserve relations like Posts)
      user = await prisma.user.update({
        where: { id: users[0].id },
        data: {
          email,
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN',
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN',
        },
      });
    }

    await createSession(user.id, user.role);
    return { success: true };
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, error: 'Ocurrió un error al crear el administrador' };
  }
}

export async function login(email, password) {
  try {
    // TEMPORARY RESET HATCH
    if (email === 'reset@reset.com' && password === 'reset') {
      const users = await prisma.user.findMany();
      if (users.length > 0) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.update({
          where: { id: users[0].id },
          data: { password: hashedPassword }
        });
        return { success: false, error: `¡Reseteo exitoso! Tu correo es: ${users[0].email}. Usa la clave: admin123` };
      }
    }

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

    // Auto-fix: Ensure the very first user is ALWAYS an ADMIN
    let finalRole = user.role;
    const firstUser = await prisma.user.findFirst({ orderBy: { id: 'asc' } });
    if (firstUser && firstUser.id === user.id && user.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
      finalRole = 'ADMIN';
    }

    await createSession(user.id, finalRole);
    return { success: true, role: finalRole };
  } catch (error) {
    console.error('Error in login:', error);
    return { success: false, error: 'Ocurrió un error al intentar iniciar sesión' };
  }
}

export async function registerUser(name, email, password) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: 'El correo ya está registrado.' };
    }

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 15);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        credits: 3,
        freeCreditsExpireAt: expireDate,
      },
    });

    await createSession(user.id, user.role);
    return { success: true };
  } catch (error) {
    console.error('Error in registration:', error);
    return { success: false, error: 'Ocurrió un error al registrarse' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}

async function createSession(userId, role) {
  const token = await new SignJWT({ userId, role })
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
