import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Restaurar Base de Datos</title>
      <meta charset="utf-8">
    </head>
    <body style="font-family: sans-serif; padding: 40px; background: #111; color: white; text-align: center;">
      <div style="max-width: 500px; margin: 0 auto; background: #222; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <h2 style="color: #e63946;">Restaurar Base de Datos</h2>
        <p style="color: #aaa; margin-bottom: 30px;">Sube aquí el archivo <b>librecielo_backup.json</b> que descargaste de tu servidor anterior.</p>
        
        <form method="POST" enctype="multipart/form-data" style="display: flex; flex-direction: column; gap: 20px;">
          <input type="file" name="backup" accept=".json" required style="padding: 10px; background: #333; border-radius: 6px;" />
          <button type="submit" style="padding: 15px; background: #e63946; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 16px;">Subir y Restaurar Datos</button>
        </form>
      </div>
    </body>
    </html>
  `;
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('backup');
    if (!file) throw new Error("No se subió ningún archivo");
    
    const text = await file.text();
    const data = JSON.parse(text);

    // 1. Tablas independientes
    if (data.users?.length) await prisma.user.createMany({ data: data.users, skipDuplicates: true });
    if (data.settings?.length) await prisma.setting.createMany({ data: data.settings, skipDuplicates: true });
    if (data.bannerAds?.length) await prisma.bannerAd.createMany({ data: data.bannerAds, skipDuplicates: true });
    if (data.pages?.length) await prisma.page.createMany({ data: data.pages, skipDuplicates: true });
    if (data.promoPopups?.length) await prisma.promoPopup.createMany({ data: data.promoPopups, skipDuplicates: true });

    // 2. Categorías (Padres primero, luego hijos)
    if (data.categories?.length) {
       const parents = data.categories.filter(c => !c.parentId);
       const children = data.categories.filter(c => c.parentId);
       if (parents.length) await prisma.category.createMany({ data: parents, skipDuplicates: true });
       if (children.length) await prisma.category.createMany({ data: children, skipDuplicates: true });
    }

    if (data.classifiedCategories?.length) {
       const parents = data.classifiedCategories.filter(c => !c.parentId);
       const children = data.classifiedCategories.filter(c => c.parentId);
       if (parents.length) await prisma.classifiedCategory.createMany({ data: parents, skipDuplicates: true });
       if (children.length) await prisma.classifiedCategory.createMany({ data: children, skipDuplicates: true });
    }

    // 3. Tablas dependientes de Nivel 1
    if (data.posts?.length) await prisma.post.createMany({ data: data.posts, skipDuplicates: true });
    if (data.classifiedAds?.length) await prisma.classifiedAd.createMany({ data: data.classifiedAds, skipDuplicates: true });

    // 4. Tablas dependientes de Nivel 2
    if (data.comments?.length) await prisma.comment.createMany({ data: data.comments, skipDuplicates: true });
    if (data.classifiedReviews?.length) await prisma.classifiedReview.createMany({ data: data.classifiedReviews, skipDuplicates: true });
    if (data.purchaseRequests?.length) await prisma.purchaseRequest.createMany({ data: data.purchaseRequests, skipDuplicates: true });
    if (data.savedItems?.length) await prisma.savedItem.createMany({ data: data.savedItems, skipDuplicates: true });

    // 5. Arreglar secuencias de IDs para que Postgres no dé error al crear nuevos
    const tables = ['User', 'Post', 'Comment', 'Setting', 'BannerAd', 'Category', 'ClassifiedCategory', 'Page', 'ClassifiedAd', 'ClassifiedReview', 'PurchaseRequest', 'PromoPopup', 'SavedItem'];
    for (const table of tables) {
        try {
            await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id)+1, 1), false) FROM "${table}";`);
        } catch(e) { console.log('Secuencia ignorada para', table) }
    }

    return new NextResponse(`
      <div style="font-family: sans-serif; background: #111; color: white; padding: 50px; text-align: center;">
        <h1 style="color: #4ade80;">¡Restauración Completa! ✅</h1>
        <p>Todos tus datos han sido importados exitosamente.</p>
        <a href="/" style="display: inline-block; padding: 15px 30px; background: #e63946; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Ir a la página principal</a>
      </div>
    `, { headers: { 'Content-Type': 'text/html' } });
    
  } catch (error) {
    return new NextResponse(`<h1 style="color:red">Error: ${error.message}</h1>`, { status: 500, headers: { 'Content-Type': 'text/html' } });
  }
}
