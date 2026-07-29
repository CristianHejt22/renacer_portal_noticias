import { getFavorites } from '@/app/actions/favorites';
import { getMe } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, Clock, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Mis Favoritos - Renacer',
};

export default async function FavoritesPage() {
  const sessionRes = await getMe();
  if (!sessionRes.success) {
    redirect('/login?callbackUrl=/mi-cuenta/favoritos');
  }

  const res = await getFavorites();
  const favorites = res.success ? res.data : [];

  const savedPosts = favorites.filter(f => f.post);
  const savedAds = favorites.filter(f => f.ad);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Bookmark className="w-8 h-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold">Mis Favoritos</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold text-foreground mb-2">No tienes favoritos aún</h2>
          <p className="text-gray-500 mb-6">Guarda las noticias y clasificados que te interesen para leerlos más tarde.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/noticias" className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 font-medium">
              Explorar Noticias
            </Link>
            <Link href="/clasificados" className="bg-white/10 text-white px-6 py-2 rounded-xl hover:bg-white/20 font-medium">
              Ver Clasificados
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Noticias Guardadas */}
          {savedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">
                  {savedPosts.length}
                </span>
                Noticias Guardadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPosts.map((fav) => (
                  <Link 
                    href={`/noticias/${fav.post.slug}`} 
                    key={fav.id}
                    className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="relative h-48 w-full bg-black/20">
                      {fav.post.coverImage ? (
                        <img 
                          src={fav.post.coverImage} 
                          alt={fav.post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                          Sin Imagen
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-xs font-bold text-white uppercase">
                        {fav.post.category || 'Noticia'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {fav.post.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mt-4">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(fav.post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Clasificados Guardados */}
          {savedAds.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="bg-green-500/20 text-green-500 w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">
                  {savedAds.length}
                </span>
                Clasificados Guardados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedAds.map((fav) => (
                  <Link 
                    href={`/clasificados/${fav.ad.slug}`} 
                    key={fav.id}
                    className="group bg-surface border border-border rounded-xl overflow-hidden hover:border-green-500/50 transition-all flex h-32"
                  >
                    <div className="relative w-32 h-full flex-shrink-0 bg-black/20">
                      {fav.ad.imageUrl ? (
                        <img 
                          src={fav.ad.imageUrl} 
                          alt={fav.ad.title} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs">
                          Sin Imagen
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <h3 className="font-bold text-sm leading-tight group-hover:text-green-400 transition-colors line-clamp-2 mb-1">
                          {fav.ad.title}
                        </h3>
                        {fav.ad.price && (
                          <div className="font-bold text-green-500 text-sm">
                            $ {fav.ad.price.toLocaleString('es-AR')}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
