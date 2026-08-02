'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Send, RefreshCw, Settings, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { getPosts, deletePost, sendPostToMake } from '@/app/actions/posts';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  
  // Import automation state
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCategory, setImportCategory] = useState('todas');
  const [importLimit, setImportLimit] = useState(20);
  const [autoPublish, setAutoPublish] = useState(false);
  const [forceImport, setForceImport] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const loadPosts = async () => {
    const res = await getPosts();
    if (res.success && res.data) {
      setPosts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

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

  const handleRunImport = async () => {
    setImporting(true);
    setLastResult(null);
    try {
      const queryParams = new URLSearchParams({
        category: importCategory,
        limit: importLimit.toString(),
        force: forceImport.toString(),
        autoPublish: autoPublish.toString(),
        t: Date.now().toString()
      });

      const res = await fetch(`/api/cron/import-minutouno?${queryParams.toString()}`, { 
        cache: 'no-store' 
      });
      const data = await res.json();
      
      if (data.success) {
        setLastResult(data);
        loadPosts();
      } else {
        alert('Error en la importación: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al importar:', error);
      alert('Ocurrió un error inesperado al conectar con el importador.');
    }
    setImporting(false);
  };

  const copyCronUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const fullUrl = `${origin}/api/cron/import-minutouno`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Noticias</h1>
          <p className="text-sm text-gray-400 mt-1">
            Administra tus publicaciones y sincroniza automáticamente noticias de fuentes externas.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} className={importing ? "animate-spin text-primary" : ""} />
            <span>Automatización / Importador</span>
          </button>

          <Link 
            href="/admin/posts/new" 
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span>Crear Noticia</span>
          </Link>
        </div>
      </div>

      {/* Modal / Panel de Configuración de Importación */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw className={importing ? "animate-spin text-primary" : "text-primary"} size={20} />
                  Automatización de Noticias (MinutoUno)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Sincroniza y actualiza noticias automáticamente respetando fechas y cambios.
                </p>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1"
                disabled={importing}
              >
                ✕
              </button>
            </div>

            {/* Opciones de Configuración */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                  Categoría a Importar
                </label>
                <select 
                  value={importCategory}
                  onChange={(e) => setImportCategory(e.target.value)}
                  disabled={importing}
                  className="w-full bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value="todas">Todas las categorías</option>
                  <option value="deportes">Deportes</option>
                  <option value="politica">Política</option>
                  <option value="economia">Economía</option>
                  <option value="espectaculos">Espectáculos</option>
                  <option value="sociedad">Sociedad</option>
                  <option value="mundo">Mundo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                  Cantidad a revisar
                </label>
                <select 
                  value={importLimit}
                  onChange={(e) => setImportLimit(Number(e.target.value))}
                  disabled={importing}
                  className="w-full bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value={10}>10 noticias más recientes</option>
                  <option value={20}>20 noticias más recientes</option>
                  <option value={30}>30 noticias más recientes</option>
                  <option value={50}>50 noticias más recientes</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={autoPublish} 
                    onChange={(e) => setAutoPublish(e.target.checked)}
                    disabled={importing}
                    className="rounded border-slate-700 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-white block">Auto-publicar noticias nuevas</span>
                    <span className="text-xs text-gray-400">Si está desactivado, se guardan como borradores para revisión previa.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-slate-700">
                  <input 
                    type="checkbox" 
                    checked={forceImport} 
                    onChange={(e) => setForceImport(e.target.checked)}
                    disabled={importing}
                    className="rounded border-slate-700 text-primary focus:ring-primary h-4 w-4"
                  />
                  <div>
                    <span className="text-sm font-medium text-white block">Forzar re-importación total</span>
                    <span className="text-xs text-gray-400">Sobrescribe incluso si no hubo cambios en la fecha de la fuente.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Resultado de la última ejecución */}
            {lastResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                  <CheckCircle2 size={16} />
                  <span>{lastResult.message}</span>
                </div>

                {lastResult.stats && (
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-green-500/10 border border-green-500/20 p-2 rounded-lg">
                      <span className="block text-green-400 font-bold text-base">{lastResult.stats.created}</span>
                      <span className="text-gray-400">Nuevas</span>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded-lg">
                      <span className="block text-blue-400 font-bold text-base">{lastResult.stats.updated}</span>
                      <span className="text-gray-400">Actualizadas</span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg">
                      <span className="block text-gray-300 font-bold text-base">{lastResult.stats.skipped}</span>
                      <span className="text-gray-400">Sin cambios</span>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                      <span className="block text-red-400 font-bold text-base">{lastResult.stats.failed}</span>
                      <span className="text-gray-400">Fallidas</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Webhook / URL de Cron Automatizado */}
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-semibold uppercase tracking-wider">URL de Ejecución Automática (Cron)</span>
                <button 
                  onClick={copyCronUrl}
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
              <p className="text-gray-400">
                Esta URL ya está configurada en <code className="text-primary font-mono">vercel.json</code> para ejecutarse cada 15 min. También puedes usarla en cron-job.org o EasyCron.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button 
                onClick={() => setShowImportModal(false)}
                disabled={importing}
                className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={handleRunImport}
                disabled={importing}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
              >
                {importing && <RefreshCw size={16} className="animate-spin" />}
                <span>{importing ? 'Importando...' : 'Ejecutar Importación Ahora'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-400">
          <RefreshCw className="animate-spin inline-block mr-2" size={20} />
          Cargando noticias...
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Título</th>
                  <th className="p-4 font-semibold text-gray-300">Categoría</th>
                  <th className="p-4 font-semibold text-gray-300">Estado</th>
                  <th className="p-4 font-semibold text-gray-300">Fecha</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-border hover:bg-background/50 transition-colors">
                    <td className="p-4 font-medium max-w-xs truncate" title={post.title}>
                      {post.title}
                    </td>
                    <td className="p-4 text-gray-400">
                      <span className="px-2 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-md text-xs">
                        {post.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      {post.isPublished ? (
                        <span className="px-2.5 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                          Publicado
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium">
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(post.createdAt).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end space-x-1">
                        <button 
                          onClick={() => handleSendToMake(post.id)} 
                          disabled={sendingId === post.id}
                          title="Enviar a Make.com (Redes)"
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <Send size={16} className={sendingId === post.id ? 'animate-pulse' : ''} />
                        </button>
                        <Link 
                          href={`/admin/posts/${post.id}/edit`} 
                          title="Editar"
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(post.id)} 
                          title="Eliminar"
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No hay noticias creadas. Ejecuta el importador automático o crea una nueva noticia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
