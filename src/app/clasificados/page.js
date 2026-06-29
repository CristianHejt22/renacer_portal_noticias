import Link from 'next/link';
import { getActiveClassifieds } from '@/app/actions/classifieds';
import { MessageCircle, Star } from 'lucide-react';

export const revalidate = 60; // ISR

export const metadata = {
  title: 'Clasificados',
  description: 'Anuncios y servicios recomendados',
};

export default async function ClassifiedsPage() {
  const res = await getActiveClassifieds();
  const classifieds = res.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Clasificados</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Encuentra los mejores productos y servicios de nuestra comunidad.
        </p>
      </div>

      {classifieds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classifieds.map((ad) => {
            const avgRating = ad.reviews.length > 0 
              ? (ad.reviews.reduce((acc, rev) => acc + rev.rating, 0) / ad.reviews.length).toFixed(1)
              : 'Nuevo';

            return (
              <Link 
                href={`/clasificados/${ad.slug}`} 
                key={ad.id} 
                className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="relative h-60 w-full overflow-hidden bg-gray-900">
                  <div 
                    className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${ad.imageUrl})` }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
                      {ad.title}
                    </h2>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6 flex-grow">
                    {ad.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <div className="flex items-center text-yellow-500 text-sm font-semibold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      <span>{avgRating}</span>
                      <span className="text-gray-500 font-normal ml-1">({ad.reviews.length})</span>
                    </div>
                    <button className="flex items-center text-sm font-semibold text-[#25D366] bg-[#25D366]/10 px-3 py-1.5 rounded-full hover:bg-[#25D366]/20 transition-colors">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contactar
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border">
          <p className="text-gray-400 text-xl">No hay clasificados disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}
