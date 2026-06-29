'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

export default function ClassifiedReviewForm({ classifiedAdId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    authorName: '',
    content: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { createReview } = await import('@/app/actions/classifieds');
      const res = await createReview({
        ...formData,
        rating,
        classifiedAdId
      });

      if (res.success) {
        setFormData({ authorName: '', content: '' });
        setRating(5);
        alert('Reseña enviada con éxito');
        router.refresh();
      } else {
        alert('Hubo un error al enviar la reseña');
      }
    } catch (error) {
      alert('Error de conexión');
    }
    
    setLoading(false);
  };

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
          <label className="block text-sm font-medium text-gray-400 mb-2">Tu Nombre</label>
          <input
            type="text"
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.authorName}
            onChange={e => setFormData({ ...formData, authorName: e.target.value })}
            placeholder="Ej. Juan Pérez"
          />
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
