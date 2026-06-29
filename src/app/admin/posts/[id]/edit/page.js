'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getPost, updatePost } from '@/app/actions/posts';
import { getBanners } from '@/app/actions/banners';
import { getCategories } from '@/app/actions/categories';

export default function EditPostPage({ params }) {
  const resolvedParams = React.use(params);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [sponsorId, setSponsorId] = useState('');
  const [availableSponsors, setAvailableSponsors] = useState([]);
  const [allBanners, setAllBanners] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      // Load available sponsors
      const bannerRes = await getBanners();
      if (bannerRes.success && bannerRes.data) {
        setAllBanners(bannerRes.data.filter(b => b.isActive));
        setAvailableSponsors(bannerRes.data.filter(b => b.position === 'watermark' && b.isActive));
      }
      
      // Load available categories
      const catRes = await getCategories();
      if (catRes.success && catRes.data) {
        setAvailableCategories(catRes.data.filter(c => c.isActive));
      }

      // Load post
      const res = await getPost(resolvedParams.id);
      if (res.success && res.data) {
        setTitle(res.data.title || '');
        setContent(res.data.content || '');
        setCategory(res.data.category || '');
        setCoverImage(res.data.coverImage || '');
        setSlug(res.data.slug || '');
        setTags(res.data.tags || '');
        setSponsorId(res.data.sponsorId ? res.data.sponsorId.toString() : '');
      } else {
        alert('Error al cargar la noticia');
        router.push('/admin/posts');
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams.id, router]);

  const handleCoverUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.url) setCoverImage(data.url);
        } catch (err) {
          console.error(err);
          alert('Error al subir la imagen');
        }
      }
    };
    input.click();
  };

  const handleSave = async (isPublished = false) => {
    if (!title || !content || !category) {
      alert('Por favor completa el título, categoría y contenido.');
      return;
    }

    setSaving(true);
    
    const postData = {
      title,
      slug,
      content,
      category,
      coverImage,
      tags,
      sponsorId: sponsorId || null,
      isPublished
    };

    const res = await updatePost(resolvedParams.id, postData);
    setSaving(false);

    if (res.success) {
      alert(isPublished ? 'Noticia publicada con éxito' : 'Borrador guardado');
      router.push('/admin/posts');
    } else {
      alert(res.error || 'Error al actualizar la noticia.');
    }
  };

  if (loading) return <p className="p-12 text-center text-gray-500">Cargando...</p>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/posts" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Editar Noticia</h1>
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
            <span>Actualizar Publicación</span>
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
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="glass p-6 rounded-xl border border-border">
          <label className="block text-sm font-medium text-gray-400 mb-2">URL del Enlace (Slug)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-gray-400"
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
        </div>

        <div className="mt-8">
          <label className="block text-lg font-bold mb-4">Contenido</label>
          <RichTextEditor content={content} onChange={setContent} availableBanners={allBanners} />
        </div>
      </div>
    </div>
  );
}
