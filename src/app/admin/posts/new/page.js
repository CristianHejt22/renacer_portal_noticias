'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/shared/Toast';
import { createPost } from '@/app/actions/posts';
import { getBanners } from '@/app/actions/banners';
import { getCategories } from '@/app/actions/categories';
import { compressImage } from '@/lib/imageCompression';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [availableSponsors, setAvailableSponsors] = useState([]);
  const [allBanners, setAllBanners] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    async function loadData() {
      const bannerRes = await getBanners();
      if (bannerRes.success && bannerRes.data) {
        setAllBanners(bannerRes.data.filter(b => b.isActive));
        setAvailableSponsors(bannerRes.data.filter(b => b.position === 'watermark' && b.isActive));
      }
      
      const catRes = await getCategories();
      if (catRes.success && catRes.data) {
        setAvailableCategories(catRes.data.filter(c => c.isActive));
      }

      // Check for auto-saved draft
      const draft = localStorage.getItem('post_draft');
      if (draft) {
        setShowRestorePrompt(true);
      }
    }
    loadData();
  }, []);

  // Auto-save effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (title || content.length > 20) {
        localStorage.setItem('post_draft', JSON.stringify({
          title, content, category, coverImage, tags, sponsorId, scheduledFor
        }));
      }
    }, 10000); // Autosave every 10s
    return () => clearInterval(timer);
  }, [title, content, category, coverImage, tags, sponsorId, scheduledFor]);

  const restoreDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem('post_draft'));
      if (draft) {
        if (draft.title) setTitle(draft.title);
        if (draft.content) setContent(draft.content);
        if (draft.category) setCategory(draft.category);
        if (draft.coverImage) setCoverImage(draft.coverImage);
        if (draft.tags) setTags(draft.tags);
        if (draft.sponsorId) setSponsorId(draft.sponsorId);
        if (draft.scheduledFor) setScheduledFor(draft.scheduledFor);
        showToast('Borrador restaurado', 'success');
      }
    } catch (e) {
      console.error(e);
    }
    setShowRestorePrompt(false);
  };

  const clearDraft = () => {
    localStorage.removeItem('post_draft');
    setShowRestorePrompt(false);
  };

  const handleCoverUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        showToast('Comprimiendo y subiendo...', 'success');
        try {
          const compressedFile = await compressImage(file, 1200, 1200, 0.8);
          const formData = new FormData();
          formData.append('file', compressedFile, file.name || 'cover.jpg');
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.url) {
            setCoverImage(data.url);
            showToast('Imagen subida con éxito', 'success');
          } else {
            throw new Error('Upload failed');
          }
        } catch (err) {
          console.error(err);
          showToast('Error al subir la imagen', 'error');
        }
      }
    };
    input.click();
  };

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleSave = async (isPublished = false) => {
    if (!title || !content || !category) {
      showToast('Por favor completa el título, categoría y contenido.', 'error');
      return;
    }

    setSaving(true);
    const slug = generateSlug(title);
    
    const postData = {
      title,
      slug,
      content,
      category,
      coverImage,
      tags,
      sponsorId: sponsorId || null,
      isPublished,
      scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null
    };

    const res = await createPost(postData);
    setSaving(false);

    if (res.success) {
      localStorage.removeItem('post_draft');
      showToast(isPublished ? 'Noticia publicada con éxito' : 'Borrador guardado', 'success');
      setTimeout(() => router.push('/admin/posts'), 1000);
    } else {
      showToast(res.error || 'Error al guardar la noticia.', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
      
      {showRestorePrompt && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
          <p className="text-yellow-200 text-sm">Tienes un borrador sin guardar guardado localmente.</p>
          <div className="flex space-x-3">
            <button onClick={clearDraft} className="text-sm text-gray-400 hover:text-white">Descartar</button>
            <button onClick={restoreDraft} className="text-sm bg-yellow-500 text-black px-3 py-1.5 rounded-lg font-bold hover:bg-yellow-400">Restaurar</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Nueva Noticia</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-border hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Guardar Borrador
          </button>
          <button 
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            <span>Publicar</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass p-6 rounded-xl border border-border">
          <label className="block text-sm font-medium text-gray-400 mb-2">Título del Artículo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título impactante..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="">Selecciona una categoría</option>
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">URL Imagen de Portada</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="flex-1 bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
              <button type="button" onClick={handleCoverUpload} className="p-3 bg-surface border border-border rounded-lg hover:bg-white/5 transition-colors">
                <ImageIcon size={20} />
              </button>
            </div>
            {coverImage && (
              <div className="mt-2 h-20 w-full rounded-md bg-cover bg-center" style={{backgroundImage: `url(${coverImage})`}}></div>
            )}
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Etiquetas / Hashtags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: tecnologia, ia, futuro"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Patrocinador (Sello de Agua)</label>
            <select
              value={sponsorId}
              onChange={(e) => setSponsorId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="">Por defecto (Configuración General)</option>
              {availableSponsors.map(sponsor => (
                <option key={sponsor.id} value={sponsor.id}>
                  {sponsor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Programar Publicación (Opcional)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
            <p className="text-xs text-gray-500 mt-2">Si dejas esto en blanco, se publicará inmediatamente (si seleccionas "Publicar").</p>
          </div>
        </div>

        <div className="mt-8">
          <label className="block text-lg font-bold mb-4">Contenido</label>
          <RichTextEditor content={content} onChange={setContent} availableBanners={allBanners} />
        </div>
      </div>
    </div>
  );
}
