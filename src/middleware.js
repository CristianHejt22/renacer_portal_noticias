import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_fallback_key_for_dev_123';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // RUTAS PÚBLICAS Y RUTAS DE LOGIN (NO REQUIEREN AUTH, O SI TIENEN AUTH NO IMPORTA)
  if (pathname === '/admin/login' || pathname === '/login' || pathname === '/registro') {
    return NextResponse.next();
  }

  // PROTEGER RUTAS DE ADMIN
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/admin/login', request.url));

    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      if (payload.role !== 'ADMIN') {
        // Un usuario normal no puede entrar al admin, mandarlo a su cuenta
        return NextResponse.redirect(new URL('/mi-cuenta', request.url));
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // PROTEGER RUTAS DE USUARIO
  if (pathname.startsWith('/mi-cuenta') || pathname === '/clasificados/publicar') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));

    try {
      // Solo verificamos que el token sea válido (Cualquier rol entra aquí)
      await jwtVerify(token, encodedSecret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/mi-cuenta/:path*', '/clasificados/publicar'],
};
