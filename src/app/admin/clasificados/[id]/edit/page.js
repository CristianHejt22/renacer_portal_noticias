'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getClassifiedById, updateClassified } from '@/app/actions/classifieds';

export default function EditClassifiedPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    whatsapp: '',
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      loadClassified();
    }
  }, [id]);

  const loadClassified = async () => {
    setInitialLoading(true);
    const res = await getClassifiedById(id);
    if (res.success && res.data) {
      setFormData({
        title: res.data.title || '',
        slug: res.data.slug || '',
        description: res.data.description || '',
        imageUrl: res.data.imageUrl || '',
        whatsapp: res.data.whatsapp || '',
        isActive: res.data.isActive !== undefined ? res.data.isActive : true,
      });
    } else {
      alert('Error loading classified');
      router.push('/admin/clasificados');
    }
    setInitialLoading(false);
  };

  const handleSlugify = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let finalSlug = formData.slug;
    if (!finalSlug) {
      finalSlug = handleSlugify(formData.title);
    }
    
    const res = await updateClassified(id, {
      ...formData,
      slug: finalSlug,
    });
    
    if (res.success) {
      router.push('/admin/clasificados');
    } else {
      alert('Error: ' + res.error);
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p>Cargando datos del clasificado...</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Editar Clasificado</h1>
        <Link href="/admin/clasificados" className="text-gray-400 hover:text-white transition-colors">
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Título / Nombre</label>
          <input
            type="text"
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
          <input
            type="text"
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.slug}
            onChange={e => setFormData({ ...formData, slug: handleSlugify(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
          <textarea
            required
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">URL de Imagen</label>
          <input
            type="url"
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.imageUrl}
            onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Número de WhatsApp (con código de país, sin +)</label>
          <input
            type="text"
            required
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.whatsapp}
            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 accent-primary"
          />
          <label htmlFor="isActive" className="text-gray-300 font-medium cursor-pointer">
            Publicado (Activo)
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Actualizar Clasificado'}
          </button>
        </div>
      </form>
    </div>
  );
}
