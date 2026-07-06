import { Eye, FileText, Share2 } from "lucide-react";
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import MigrationButton from '@/components/admin/MigrationButton';
import PurchaseRequestTable from '@/components/admin/PurchaseRequestTable';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const publishedCount = await prisma.post.count({
    where: { isPublished: true }
  });

  const latestPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  let pendingRequests = [];
  try {
    pendingRequests = await prisma.purchaseRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching purchase requests (DB may not be synced):", error);
  }

  const banners = await prisma.bannerAd.findMany();
  const totalVisits = banners.reduce((sum, b) => sum + (b.views || 0), 0);
  const networkImpact = banners.reduce((sum, b) => sum + (b.clicks || 0), 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Resumen General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Visitas Totales</h3>
            <Eye className="text-primary" />
          </div>
          <p className="text-4xl font-bold">{totalVisits.toLocaleString()}</p>
          <p className="text-sm text-green-500 mt-2">Basado en impresiones</p>
        </div>
        
        <div className="glass p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Noticias Publicadas</h3>
            <FileText className="text-accent" />
          </div>
          <p className="text-4xl font-bold">{publishedCount}</p>
          <p className="text-sm text-gray-500 mt-2">Total histórico</p>
        </div>

        <div className="glass p-6 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-400">Impacto en Redes</h3>
            <Share2 className="text-purple-500" />
          </div>
          <p className="text-4xl font-bold">{networkImpact.toLocaleString()}</p>
          <p className="text-sm text-green-500 mt-2">Interacciones y clics</p>
        </div>
      </div>

      <PurchaseRequestTable initialRequests={pendingRequests} />

      <div className="glass p-6 rounded-xl border border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Últimas Publicaciones</h2>
          <Link href="/admin/posts" className="text-sm text-primary hover:underline">
            Ver todas
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-gray-400 font-medium">Título</th>
                <th className="pb-3 text-gray-400 font-medium">Categoría</th>
                <th className="pb-3 text-gray-400 font-medium">Fecha</th>
                <th className="pb-3 text-gray-400 font-medium">Estado</th>
                <th className="pb-3 text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {latestPosts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No hay noticias creadas todavía.
                  </td>
                </tr>
              ) : (
                latestPosts.map((post) => (
                  <tr key={post.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="line-clamp-1 max-w-xs">{post.title}</div>
                    </td>
                    <td className="py-4 text-sm text-gray-400">{post.category || 'Sin categoría'}</td>
                    <td className="py-4 text-sm">
                      {new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4">
                      {post.isPublished ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">Publicado</span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">Borrador</span>
                      )}
                    </td>
                    <td className="py-4 text-sm">
                      <Link href={`/admin/posts/${post.id}/edit`} className="text-primary hover:underline">
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <MigrationButton />
    </div>
  );
}
