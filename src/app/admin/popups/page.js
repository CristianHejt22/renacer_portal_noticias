'use client';

import { useState, useEffect } from 'react';
import { getPopups, savePopup, deletePopup, togglePopupActive } from '@/app/actions/popups';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Globe, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function PopupsAdminPage() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    maxViews: 1,
    resetPeriod: 'never',
    isActive: false
  });

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    setLoading(true);
    const res = await getPopups();
    if (res.success) {
      setPopups(res.data);
    } else {
      toast.error('Error al cargar los popups');
    }
    setLoading(false);
  };

  const handleOpenModal = (popup = null) => {
    if (popup) {
      setEditingPopup(popup.id);
      setFormData({
        title: popup.title,
        imageUrl: popup.imageUrl || '',
        targetUrl: popup.targetUrl || '',
        maxViews: popup.maxViews,
        resetPeriod: popup.resetPeriod,
        isActive: popup.isActive
      });
    } else {
      setEditingPopup(null);
      setFormData({
        title: '',
        imageUrl: '',
        targetUrl: '',
        maxViews: 1,
        resetPeriod: 'never',
        isActive: false
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await savePopup({ ...formData, id: editingPopup });
    if (res.success) {
      toast.success(editingPopup ? 'Popup actualizado' : 'Popup creado');
      setIsModalOpen(false);
      fetchPopups();
    } else {
      toast.error(res.error || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este popup?')) {
      const res = await deletePopup(id);
      if (res.success) {
        toast.success('Popup eliminado');
        fetchPopups();
      } else {
        toast.error('Error al eliminar');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const res = await togglePopupActive(id, !currentStatus);
    if (res.success) {
      toast.success(!currentStatus ? 'Popup Activado' : 'Popup Desactivado');
      fetchPopups();
    } else {
      toast.error('Error al cambiar estado');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit
    if (file.size > 15 * 1024 * 1024) {
      toast.error('La imagen es demasiado grande. Máximo 15MB.');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Subiendo imagen...');

    const formData = new FormData();
    formData.append('file', file, file.name);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      toast.success('Imagen subida correctamente', { id: toastId });
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Ocurrió un error al subir la imagen', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Popups Promocionales</h1>
          <p className="text-muted-foreground mt-1">Configura alertas emergentes para tus usuarios</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Nuevo Popup
        </button>
      </div>

      <div className="glass p-6 rounded-2xl border border-border/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Cargando...</div>
        ) : popups.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No hay popups configurados</h3>
            <p className="text-muted-foreground mt-1">Crea tu primer popup promocional haciendo clic en el botón superior.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 text-sm font-semibold text-muted-foreground">Título</th>
                  <th className="pb-3 text-sm font-semibold text-muted-foreground">Frecuencia</th>
                  <th className="pb-3 text-sm font-semibold text-muted-foreground">Visualizaciones</th>
                  <th className="pb-3 text-sm font-semibold text-muted-foreground text-center">Estado</th>
                  <th className="pb-3 text-sm font-semibold text-muted-foreground text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((popup) => (
                  <tr key={popup.id} className="border-b border-border/20 hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="font-medium">{popup.title}</div>
                      {popup.targetUrl && (
                        <div className="text-xs text-blue-400 mt-1 truncate max-w-xs">{popup.targetUrl}</div>
                      )}
                    </td>
                    <td className="py-4 text-sm">
                      {popup.resetPeriod === 'never' && 'Solo las configuradas'}
                      {popup.resetPeriod === 'daily' && 'Diario'}
                      {popup.resetPeriod === 'weekly' && 'Semanal'}
                      {popup.resetPeriod === 'monthly' && 'Mensual'}
                    </td>
                    <td className="py-4 text-sm">Máx. {popup.maxViews} veces</td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(popup.id, popup.isActive)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          popup.isActive 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                      >
                        {popup.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {popup.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(popup)}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(popup.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <h2 className="text-xl font-bold mb-4">{editingPopup ? 'Editar Popup' : 'Nuevo Popup Promocional'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título / Descripción interna</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ej: Promo Verano"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL de la Imagen (Obligatorio)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-2.5 text-muted-foreground w-5 h-5" />
                    <input
                      type="url"
                      required
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="w-full bg-black/20 border border-border rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="https://ejemplo.com/promo.jpg o /uploads/..."
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <button 
                      type="button" 
                      disabled={isUploading}
                      className="h-full px-4 bg-primary/20 hover:bg-primary/30 text-primary rounded-xl flex items-center gap-2 font-medium transition-colors border border-primary/30 disabled:opacity-50"
                    >
                      <Upload size={18} />
                      {isUploading ? 'Subiendo...' : 'Subir'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Sube una imagen desde tu equipo o pega un enlace externo. Recomendado: formato cuadrado o vertical.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Redirección al hacer clic (Opcional)</label>
                <input
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                  className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Máx. Visualizaciones</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.maxViews}
                    onChange={(e) => setFormData({...formData, maxViews: e.target.value})}
                    className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reiniciar contador</label>
                  <select
                    value={formData.resetPeriod}
                    onChange={(e) => setFormData({...formData, resetPeriod: e.target.value})}
                    className="w-full bg-black/20 border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary outline-none appearance-none"
                  >
                    <option value="never">Nunca (Mostrar solo {formData.maxViews} veces en total)</option>
                    <option value="daily">Diario (Mostrar {formData.maxViews} al día)</option>
                    <option value="weekly">Semanal (Mostrar {formData.maxViews} a la semana)</option>
                    <option value="monthly">Mensual (Mostrar {formData.maxViews} al mes)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center mt-4">
                <label className="flex items-center cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded accent-primary bg-black/20 border-border"
                  />
                  <span className="text-sm font-medium">Activar este popup (Se desactivarán los demás)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Guardar Popup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
