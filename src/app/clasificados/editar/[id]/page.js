'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getClassifiedCategories } from '@/app/actions/classifiedCategories';
import { Tag, DollarSign, AlignLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditClassifiedPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    classifiedCategoryId: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setInitialLoading(true);
    
    // Load categories
    const catRes = await getClassifiedCategories();
    if (catRes.success) setCategories(catRes.data);

    // Load ad
    const { getClassifiedById } = await import('@/app/actions/classifieds');
    const adRes = await getClassifiedById(id);
    
    if (adRes.success && adRes.data) {
      const ad = adRes.data;
      setFormData({
        title: ad.title,
        description: ad.description,
        price: ad.price ? ad.price.toString() : '',
        classifiedCategoryId: ad.classifiedCategoryId ? ad.classifiedCategoryId.toString() : '',
      });
    } else {
      alert('Aviso no encontrado o no autorizado');
      router.push('/mi-cuenta');
    }
    
    setInitialLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { updateUserClassified } = await import('@/app/actions/classifieds');
    const res = await updateUserClassified(id, formData);

    if (res.success) {
      alert('¡Tu aviso ha sido actualizado con éxito!');
      router.push('/mi-cuenta');
    } else {
      alert(res.error || 'Error al actualizar el aviso');
    }
    setLoading(false);
  };

  if (initialLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Cargando aviso...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Editar Aviso</h1>
            <p className="text-gray-600 dark:text-gray-400">Modifica los textos y detalles de tu anuncio publicado</p>
          </div>
          <Link href="/mi-cuenta" className="text-primary font-medium hover:underline">Volver a Mi Cuenta</Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface glass border border-border p-8 rounded-2xl shadow-xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del Aviso</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Tag size={18} />
              </div>
              <input 
                type="text" required maxLength={60}
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (Opcional, en ARS)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <DollarSign size={18} />
                </div>
                <input 
                  type="number" min="0" step="1"
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select 
                required
                value={formData.classifiedCategoryId} 
                onChange={e => setFormData({...formData, classifiedCategoryId: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="">-- Selecciona una categoría --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-gray-500">
                <AlignLeft size={18} />
              </div>
              <textarea 
                required rows={6}
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <button 
              type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50 text-lg flex justify-center items-center"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">Nota: Las fotos no se pueden cambiar una vez publicado.</p>
          </div>
        </form>
      </div>
    </div>
  );
}
