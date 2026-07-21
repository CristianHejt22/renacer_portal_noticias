'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ClassifiedReviewForm({ classifiedAdId, user }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createReview } = await import('@/app/actions/classifieds');
      const res = await createReview({
        authorName: user.name,
        content: formData.content,
        rating,
        classifiedAdId
      });

      if (res.success) {
        setFormData({ content: '' });
        setRating(5);
        toast.success('Reseña publicada con éxito');
        router.refresh();
      } else {
        toast.error(res.error || 'Hubo un error al enviar la reseña');
      }
    } catch (error) {
      toast.error('Error de conexión al enviar la reseña');
    }
    
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="bg-surface border border-border p-8 rounded-xl sticky top-24 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <LogIn className="text-primary" size={32} />
        </div>
        <h3 className="text-xl font-bold mb-2">Dejar una Reseña</h3>
        <p className="text-gray-500 mb-6">Debes iniciar sesión para poder dejar tu opinión sobre este anuncio.</p>
        <Link 
          href="/login"
          className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border p-6 rounded-xl sticky top-24">
      <h3 className="text-xl font-bold mb-6">Dejar una Reseña</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Calificación</label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star 
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-gray-600'
                  }`} 
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Publicando como</label>
          <div className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white font-bold opacity-75">
            {user.name}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Comentario</label>
          <textarea
            required
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            placeholder="¿Qué te pareció este producto o servicio?"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Publicar Reseña'}
        </button>
      </form>
    </div>
  );
}
