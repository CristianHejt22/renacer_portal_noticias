'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '', order: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const res = await getCategories();
    if (res.success && res.data) {
      setCategories(res.data);
    }
    setLoading(false);
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', order: categories.length, isActive: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, slug: category.slug, order: category.order, isActive: category.isActive });
    setIsModalOpen(true);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    if (!editingId) {
      setFormData({ ...formData, name, slug: generateSlug(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let res;
    if (editingId) {
      res = await updateCategory(editingId, formData);
    } else {
      res = await createCategory(formData);
    }
    setSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      setEditingId(null);
      loadCategories();
    } else {
      alert(res.error || 'Error al guardar la categoría.');
    }
  };

  const handleToggle = async (category) => {
    await updateCategory(category.id, { ...category, isActive: !category.isActive });
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta categoría? (Asegúrate de reasignar las noticias primero)')) {
      const res = await deleteCategory(id);
      if (res.success) {
        loadCategories();
      } else {
        alert(res.error || 'Error al eliminar');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Categorías</h1>
          <p className="text-gray-400">Gestiona las categorías que aparecen en el menú principal.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      {loading ? (
        <p>Cargando categorías...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Orden</th>
                <th className="p-4 font-semibold text-gray-300">Nombre</th>
                <th className="p-4 font-semibold text-gray-300">Slug</th>
                <th className="p-4 font-semibold text-gray-300">Activo en Menú</th>
                <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-4 text-gray-400">{cat.order}</td>
                  <td className="p-4 font-bold">
                    {cat.parentId ? <span className="text-gray-500 mr-2">↳</span> : ''}
                    {cat.name}
                  </td>
                  <td className="p-4 text-primary">{cat.slug}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(cat)} className="text-gray-400 hover:text-white">
                      {cat.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(cat)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay categorías creadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-xl border border-border w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input required type="text" value={formData.name} onChange={handleNameChange} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ej: Tecnología" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input required type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="tecnologia" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Orden (prioridad en el menú)</label>
                <input required type="number" min="0" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoría Superior (Opcional)</label>
                <select 
                  value={formData.parentId || ''} 
                  onChange={e => setFormData({...formData, parentId: e.target.value})} 
                  className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
                >
                  <option value="">Ninguna (Categoría Principal)</option>
                  {categories.filter(c => c.id !== editingId && c.parentId === null).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={saving} className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
