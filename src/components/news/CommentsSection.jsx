'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { getComments, createComment } from '@/app/actions/comments';

export default function CommentsSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    const res = await getComments(postId);
    if (res.success) {
      setComments(res.data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    setSubmitting(true);
    const res = await createComment(postId, name, content);
    if (res.success) {
      setContent('');
      loadComments();
    } else {
      alert(res.error || 'No se pudo enviar el comentario');
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-12 bg-surface border border-border rounded-xl p-6 md:p-8">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-6 h-6 mr-3 text-primary" />
        <h3 className="text-2xl font-bold">Comentarios ({comments.length})</h3>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full md:w-1/3 bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <textarea
            placeholder="Escribe tu comentario aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            <span>{submitting ? 'Enviando...' : 'Comentar'}</span>
            <Send size={16} />
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-gray-500">Cargando comentarios...</p>
      ) : (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aún no hay comentarios. ¡Sé el primero en opinar!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-foreground">{comment.authorName}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
