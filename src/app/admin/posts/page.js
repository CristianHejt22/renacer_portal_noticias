'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Send } from 'lucide-react';
import { getPosts, deletePost, sendPostToMake } from '@/app/actions/posts';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const res = await getPosts();
    if (res.success && res.data) {
      setPosts(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta noticia?')) {
      await deletePost(id);
      loadPosts();
    }
  };

  const handleSendToMake = async (id) => {
    if (confirm('¿Enviar esta noticia a Redes Sociales a través de Make.com?')) {
      setSendingId(id);
      const res = await sendPostToMake(id);
      if (res.success) {
        alert('¡Enviado exitosamente a Make.com!');
      } else {
        alert(res.error || 'Error al enviar');
      }
      setSendingId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Noticias</h1>
        <Link 
          href="/admin/posts/new" 
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Crear Noticia</span>
        </Link>
      </div>

      {loading ? (
        <p>Cargando noticias...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Título</th>
                <th className="p-4 font-semibold text-gray-300">Slug</th>
                <th className="p-4 font-semibold text-gray-300">Estado</th>
                <th className="p-4 font-semibold text-gray-300">Fecha</th>
                <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-4 font-medium max-w-xs truncate">{post.title}</td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{post.slug}</td>
                  <td className="p-4">
                    {post.isPublished ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">Publicado</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">Borrador</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <button 
                      onClick={() => handleSendToMake(post.id)} 
                      disabled={sendingId === post.id}
                      title="Enviar a Make.com (Redes)"
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send size={18} className={sendingId === post.id ? 'animate-pulse' : ''} />
                    </button>
                    <Link href={`/admin/posts/${post.id}/edit`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay noticias creadas. Crea una nueva noticia para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
