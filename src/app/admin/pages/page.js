'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Edit, FileText } from 'lucide-react';
import { getPages, deletePage } from '@/app/actions/pages';

export default function PagesAdminPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    const res = await getPages();
    if (res.success && res.data) {
      setPages(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta página de forma permanente?')) {
      const res = await deletePage(id);
      if (res.success) {
        loadPages();
      } else {
        alert(res.error || 'Error al eliminar la página.');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Páginas Dinámicas</h1>
          <p className="text-gray-400">Crea y edita secciones primordiales como "Contacto", "Nosotros", etc.</p>
        </div>
        <Link 
          href="/admin/pages/new"
          className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Página
        </Link>
      </div>

      {loading ? (
        <p>Cargando páginas...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Título</th>
                <th className="p-4 font-semibold text-gray-300">URL (Slug)</th>
                <th className="p-4 font-semibold text-gray-300">Estado</th>
                <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-4 font-bold flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    {page.title}
                  </td>
                  <td className="p-4 text-primary font-mono text-xs">/{page.slug}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${page.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {page.isPublished ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/pages/${page.id}/edit`} className="inline-block p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(page.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No hay páginas creadas. Comienza creando una nueva página.
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
