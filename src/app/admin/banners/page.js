'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, MousePointerClick, Image as ImageIcon, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { getBanners, createBanner, toggleBannerStatus, deleteBanner, updateBanner } from '@/app/actions/banners';

export default function BannersAdminPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', imageUrl: '', targetUrl: '', position: 'plan-local' });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    const res = await getBanners();
    if (res.success || res.data) {
      setBanners(res.data);
    }
    setLoading(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setFormData({ ...formData, imageUrl: result.url });
      }
    } catch (error) {
      alert('Error subiendo imagen');
    } finally {
      setUploading(false);
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', imageUrl: '', targetUrl: '', position: 'plan-local' });
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingId(banner.id);
    setFormData({ name: banner.name, imageUrl: banner.imageUrl, targetUrl: banner.targetUrl, position: banner.position || 'plan-local' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let res;
    if (editingId) {
      res = await updateBanner(editingId, formData);
    } else {
      res = await createBanner(formData);
    }

    if (res.success) {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', imageUrl: '', targetUrl: '', position: 'plan-local' });
      loadBanners();
    } else {
      alert('Error: Asegúrate de tener la Base de Datos configurada para guardar permanentemente.');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    await toggleBannerStatus(id, currentStatus);
    loadBanners();
  };

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar banner?')) {
      await deleteBanner(id);
      loadBanners();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planes Publicitarios</h1>
          <p className="text-gray-400">Gestiona los planes de patrocinio (Local, Deportivo, Cielo Total, etc.).</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg font-semibold flex items-center transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Crear Banner
        </button>
      </div>

      {loading ? (
        <p>Cargando banners...</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-gray-300">Banner</th>
                <th className="p-4 font-semibold text-gray-300">Ubicación</th>
                <th className="p-4 font-semibold text-gray-300">Métricas</th>
                <th className="p-4 font-semibold text-gray-300">Estado</th>
                <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {banners.map(banner => (
                <tr key={banner.id} className="border-b border-border hover:bg-background/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      {banner.imageUrl ? (
                        <img src={banner.imageUrl} alt={banner.name} className="w-20 h-12 object-cover rounded bg-white" />
                      ) : (
                        <div className="w-20 h-12 bg-gray-800 rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold">{banner.name}</p>
                        <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block truncate w-40">
                          {banner.targetUrl}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize">{banner.position}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-4 text-gray-400">
                      <span className="flex items-center" title="Vistas">
                        <Eye className="w-4 h-4 mr-1" /> {banner.views}
                      </span>
                      <span className="flex items-center" title="Clics">
                        <MousePointerClick className="w-4 h-4 mr-1" /> {banner.clicks}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(banner.id, banner.isActive)} className="text-gray-400 hover:text-white">
                      {banner.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => openEditModal(banner)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {banners.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No hay banners creados.
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
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Editar Banner' : 'Nuevo Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre referencial</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Ej: Promoción Verano" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Imagen del Banner / Sello (Sube o pega un enlace)</label>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-4">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="bannerImage" />
                    <label htmlFor="bannerImage" className="cursor-pointer bg-background border border-border px-4 py-2 rounded-lg hover:border-primary transition-colors text-center shrink-0">
                      {uploading ? 'Subiendo...' : 'Seleccionar de PC'}
                    </label>
                    <span className="text-gray-500 font-medium">o</span>
                    <input 
                      type="url" 
                      value={formData.imageUrl} 
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                      className="flex-1 bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" 
                      placeholder="https://ejemplo.com/imagen.jpg" 
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="flex justify-center bg-white/5 p-2 rounded-lg">
                      <img src={formData.imageUrl} className="h-20 object-contain rounded" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL de Redirección (Opcional en Sello de Agua)</label>
                <input type="url" value={formData.targetUrl} onChange={e => setFormData({...formData, targetUrl: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="https://..." />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Plan / Ubicación</label>
                <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full bg-background border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="plan-local">Plan Local (Cuadrado en sección Local)</option>
                  <option value="plan-deportivo">Plan Deportivo (Banner Deportes + Placas)</option>
                  <option value="plan-internacional">Plan Internacional (Cabecera Global)</option>
                  <option value="plan-nacional">Plan Nacional (Central en Home/Nacional)</option>
                  <option value="plan-cielo-total">Plan Cielo Total (Megabanner 100% superior)</option>
                  <option value="watermark">Sello de Agua (Patrocinador en foto de portada)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={uploading} className="bg-primary hover:bg-accent text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
