'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { getAllClassifieds, deleteClassified } from '@/app/actions/classifieds';

export default function ClassifiedsPage() {
  const [classifieds, setClassifieds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassifieds();
  }, []);

  const loadClassifieds = async () => {
    setLoading(true);
    const res = await getAllClassifieds();
    if (res.success && res.data) {
      setClassifieds(res.data);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este clasificado?')) {
      await deleteClassified(id);
      loadClassifieds();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Clasificados</h1>
        <Link 
          href="/admin/clasificados/nuevo" 
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Crear Clasificado</span>
        </Link>
      </div>

      {loading ? (
        <p>Cargando clasificados...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Título</th>
                <th className="p-4 font-semibold text-gray-300">WhatsApp</th>
                <th className="p-4 font-semibold text-gray-300 text-center">Clicks</th>
                <th className="p-4 font-semibold text-gray-300">Estado</th>
                <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {classifieds.map(ad => (
                <tr key={ad.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-4 font-medium max-w-xs truncate">{ad.title}</td>
                  <td className="p-4 text-gray-400">{ad.whatsapp}</td>
                  <td className="p-4 text-center font-bold text-accent">{ad.clicks}</td>
                  <td className="p-4">
                    {ad.isActive ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">Activo</span>
                    ) : (
                      <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">Inactivo</span>
                    )}
                  </td>
                  <td className="p-4 text-right flex justify-end space-x-2">
                    <Link href={`/clasificados/${ad.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors">
                      <ExternalLink size={18} />
                    </Link>
                    <Link href={`/admin/clasificados/${ad.id}/edit`} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(ad.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {classifieds.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay clasificados creados.
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
