'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClassified } from '@/app/actions/classifieds';
import { getClassifiedCategories } from '@/app/actions/classifiedCategories';

export default function NewClassifiedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    images: '',
    price: '',
    categoryId: '',
    whatsapp: '',
    isActive: true,
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      const res = await getClassifiedCategories();
      if (res.success) setCategories(res.data);
    }
    loadCategories();
  }, []);

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
    
    try {
      const formattedImages = formData.images
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '');

      const res = await createClassified({
        ...formData,
        images: formattedImages,
        slug: finalSlug,
      });
      
      if (res && res.success) {
        router.push('/admin/clasificados');
      } else {
        alert('Error: ' + (res?.error || 'No se pudo guardar el clasificado'));
        setLoading(false);
      }
    } catch (error) {
      alert('Error de conexión o de base de datos. ¿Ejecutaste prisma db push? Detalle: ' + error.message);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Precio ($ ARS)</label>
            <input
              type="number"
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: e.target.value })}
              placeholder="Ej: 15000 (Opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <select
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Sin Categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">URL de Imagen Principal</label>
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
          <label className="block text-sm font-medium text-gray-300 mb-2">Imágenes Adicionales (separadas por coma)</label>
          <textarea
            rows={2}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            value={formData.images}
            onChange={e => setFormData({ ...formData, images: e.target.value })}
            placeholder="https://ejemplo.com/img1.jpg, https://ejemplo.com/img2.jpg"
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
