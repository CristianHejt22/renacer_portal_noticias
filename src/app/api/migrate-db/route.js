import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { supabaseUrl, secret } = await request.json();

    // Seguridad simple
    if (secret !== 'renacer-migracion-coolify') {
      return NextResponse.json({ success: false, error: 'Acceso denegado' }, { status: 401 });
    }

    if (!supabaseUrl) {
      return NextResponse.json({ success: false, error: 'Falta supabaseUrl' }, { status: 400 });
    }

    // Conectar a Supabase usando pg
    const pgClient = new Client({
      connectionString: supabaseUrl,
    });
    
    await pgClient.connect();

    // 1. Obtener todos los datos de Supabase
    const { rows: users } = await pgClient.query('SELECT * FROM "User" ORDER BY id ASC');
    const { rows: categories } = await pgClient.query('SELECT * FROM "Category" ORDER BY id ASC');
    const { rows: posts } = await pgClient.query('SELECT * FROM "Post" ORDER BY id ASC');
    const { rows: comments } = await pgClient.query('SELECT * FROM "Comment" ORDER BY id ASC');
    const { rows: settings } = await pgClient.query('SELECT * FROM "Setting" ORDER BY id ASC');
    const { rows: banners } = await pgClient.query('SELECT * FROM "BannerAd" ORDER BY id ASC');
    const { rows: pages } = await pgClient.query('SELECT * FROM "Page" ORDER BY id ASC');

    await pgClient.end();

    // 2. Insertar en la base de datos local (Coolify)
    // Borramos todo primero por si se ejecuta dos veces
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.page.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.bannerAd.deleteMany({});
    await prisma.setting.deleteMany({});
    await prisma.user.deleteMany({});

    // Insertar con transacciones para asegurar la integridad
    await prisma.$transaction(async (tx) => {
      // Users
      if (users.length > 0) {
        await tx.user.createMany({ data: users });
      }
      
      // Categories
      if (categories.length > 0) {
        await tx.category.createMany({ data: categories });
      }

      // Posts
      if (posts.length > 0) {
        await tx.post.createMany({ data: posts });
      }

      // Comments
      if (comments.length > 0) {
        await tx.comment.createMany({ data: comments });
      }

      // Settings
      if (settings.length > 0) {
        await tx.setting.createMany({ data: settings });
      }

      // Banners
      if (banners.length > 0) {
        await tx.bannerAd.createMany({ data: banners });
      }

      // Pages
      if (pages.length > 0) {
        await tx.page.createMany({ data: pages });
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '¡Migración completada con éxito!',
      stats: {
        users: users.length,
        posts: posts.length,
        categories: categories.length
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
