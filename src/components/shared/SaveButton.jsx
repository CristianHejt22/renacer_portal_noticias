'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { toggleFavorite, checkIsFavorite } from '@/app/actions/favorites';
import { toast } from 'sonner';

export default function SaveButton({ type, id }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function check() {
      const res = await checkIsFavorite(type, id);
      if (isMounted && res.success) {
        setIsSaved(res.isFavorited);
      }
      if (isMounted) setLoading(false);
    }
    check();
    return () => {
      isMounted = false;
    };
  }, [type, id]);

  const handleToggle = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (loading) return;
    
    setLoading(true);
    const res = await toggleFavorite(type, id);
    if (res.success) {
      setIsSaved(res.isFavorited);
      toast.success(res.isFavorited ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    } else {
      toast.error(res.error || 'Ocurrió un error');
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors flex items-center justify-center z-10 ${
        isSaved 
          ? 'bg-primary/20 text-primary hover:bg-primary/30' 
          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSaved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <Bookmark 
        size={22} 
        className={isSaved ? 'fill-primary' : ''} 
      />
    </button>
  );
}
