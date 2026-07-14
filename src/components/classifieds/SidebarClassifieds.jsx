import Link from 'next/link';
import { Star } from 'lucide-react';
import { getActiveClassifieds } from '@/app/actions/classifieds';

export default async function SidebarClassifieds() {
  const res = await getActiveClassifieds({ featuredOnly: true });
  const classifieds = res.data?.slice(0, 3) || []; // Get top 3

  if (classifieds.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center border-b border-border pb-2">
        <span className="w-2 h-6 bg-primary mr-3 rounded-full"></span>
        Clasificados
      </h3>
      <div className="space-y-4">
        {classifieds.map((ad) => {
          const avgRating = ad.reviews?.length > 0 
            ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
            : 'Nuevo';

          return (
            <Link 
              href={`/clasificados/${ad.slug}`} 
              key={ad.id} 
              className="group flex gap-4 items-start bg-background p-2 rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              <div className="relative h-16 w-20 flex-shrink-0 rounded-md overflow-hidden bg-secondary">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${ad.imageUrl})` }}
                />
              </div>
              <div className="flex-grow flex flex-col justify-center min-w-0">
                <h4 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                  {ad.title}
                </h4>
                {ad.price && (
                  <span className="text-primary text-xs font-bold mt-1">
                    $ {ad.price.toLocaleString('es-AR')}
                  </span>
                )}
                <div className="flex items-center text-yellow-500 text-[10px] font-semibold mt-1">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  <span>{avgRating}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Link href="/clasificados" className="block text-center text-sm text-primary hover:text-accent font-semibold mt-4 pt-4 border-t border-border transition-colors">
        Ver todos los anuncios →
      </Link>
    </div>
  );
}
