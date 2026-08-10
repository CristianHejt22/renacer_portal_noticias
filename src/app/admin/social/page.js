import { PrismaClient } from '@prisma/client';
import GeneratorClient from './GeneratorClient';
import { Share2 } from 'lucide-react';

const prisma = new PrismaClient();

export const metadata = {
  title: 'Generador de Placas - Admin',
};

export default async function AdminSocialPage() {
  // Obtener las últimas 50 noticias publicadas para el autocompletado
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      category: true,
    }
  });

  // Mapear los datos de las noticias para el cliente
  const formattedPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    imageUrl: post.coverImage || post.image || '',
    category: post.category?.name || 'NOTICIA',
    date: post.createdAt,
  }));

  return (
    <div className="w-full h-full pb-20">
      <div className="mb-6">
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-3">
          <Share2 className="text-primary" size={28} />
          Generador de Redes Sociales
        </h1>
        <p className="text-muted-foreground mt-2">
          Crea placas profesionales para Instagram, Facebook y WhatsApp en segundos.
        </p>
      </div>

      {/* Componente Cliente que maneja el canvas y el editor */}
      <GeneratorClient posts={formattedPosts} />
    </div>
  );
}
