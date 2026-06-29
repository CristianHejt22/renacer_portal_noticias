'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClassified } from '@/app/actions/classifieds';

export default function NewClassifiedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    whatsapp: '',
    isActive: true,
  });

  const handleSlugify = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Auto-generate slug if empty
    let finalSlug = formData.slug;
    if (!finalSlug) {
      finalSlug = handleSlugify(formData.title);
    }
    
    const res = await createClassified({
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

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Nuevo Clasificado</h1>
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
            placeholder="Se generará automáticamente si se deja en blanco"
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
            placeholder="https://ejemplo.com/imagen.jpg"
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
            placeholder="Ej: 5491123456789"
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
            {loading ? 'Guardando...' : 'Crear Clasificado'}
          </button>
        </div>
      </form>
    </div>
  );
}
