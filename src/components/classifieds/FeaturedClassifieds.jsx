import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { getActiveClassifieds } from '@/app/actions/classifieds';

export default async function FeaturedClassifieds() {
  const res = await getActiveClassifieds();
  const classifieds = res.data?.slice(0, 3) || []; // Get top 3

  if (classifieds.length === 0) return null;

  return (
    <section className="mt-12 bg-surface border border-border rounded-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 flex items-center">
          <span className="w-2 h-6 bg-primary mr-3 rounded-full hidden sm:block"></span>
          Clasificados Destacados
        </h2>
        <Link href="/clasificados" className="text-primary hover:text-accent transition-colors flex items-center font-semibold">
          Ver todos <ArrowRight className="ml-1 w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classifieds.map((ad) => {
          const avgRating = ad.reviews?.length > 0 
            ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
            : 'Nuevo';

          return (
            <Link 
              href={`/clasificados/${ad.slug}`} 
              key={ad.id} 
              className="group flex flex-col bg-background border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden bg-secondary">
                <Image 
                  src={ad.imageUrl || '/placeholder.jpg'}
                  alt={ad.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {ad.price && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-sm font-bold">
                    $ {ad.price.toLocaleString('es-AR')}
                  </div>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                {ad.category && (
                  <span className="text-xs text-primary mb-2 uppercase tracking-wider font-bold">
                    {ad.category.name}
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                  {ad.title}
                </h3>
                <div className="flex items-center text-yellow-500 text-xs font-semibold mt-auto pt-3 border-t border-border">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  <span>{avgRating}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
