import Link from 'next/link';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function RelatedArticles({ category, currentPostId }) {
  if (!category) return null;

  try {
    const relatedPosts = await prisma.post.findMany({
      where: {
        category: category,
        isPublished: true,
        id: { not: currentPostId },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    if (relatedPosts.length === 0) return null;

    return (
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-2xl font-bold mb-6 flex items-center">
          <span className="w-8 h-1 bg-primary mr-3 rounded"></span>
          Más noticias de {category}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedPosts.map((post) => (
            <Link key={post.id} href={`/noticias/${post.slug}`} className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-colors">
              {post.coverImage ? (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-background flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}
              <div className="p-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 block">
                  {post.category}
                </span>
                <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-3">
                  {post.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return null;
  }
}
