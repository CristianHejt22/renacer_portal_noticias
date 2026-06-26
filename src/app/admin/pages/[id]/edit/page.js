'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getPageById, updatePage } from '@/app/actions/pages';

export default function EditPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editorMode, setEditorMode] = useState('visual'); // 'visual' | 'html'
  const router = useRouter();

  useEffect(() => {
    async function loadPage() {
      const res = await getPageById(id);
      if (res.success && res.data) {
        setTitle(res.data.title);
        setSlug(res.data.slug);
        setContent(res.data.content);
        setIsPublished(res.data.isPublished);
      } else {
        alert('Página no encontrada');
        router.push('/admin/pages');
      }
      setLoading(false);
    }
    loadPage();
  }, [id, router]);

  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSave = async (publish = false) => {
    if (!title || !slug || !content) {
      alert('Por favor completa el título, slug y contenido.');
      return;
    }

    setSaving(true);
    const res = await updatePage(id, {
      title,
      slug,
      content,
      isPublished: publish
    });
    setSaving(false);

    if (res.success) {
      alert(publish ? 'Página actualizada y publicada' : 'Borrador actualizado');
      router.push('/admin/pages');
    } else {
      alert(res.error || 'Error al actualizar la página.');
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando editor...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin/pages" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Editar Página</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Título de la Página</label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Ej: Sobre Nosotros"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          
          <div className="glass p-6 rounded-xl border border-border">
            <label className="block text-sm font-medium text-gray-400 mb-2">Slug (URL)</label>
            <div className="flex items-center">
              <span className="text-gray-500 bg-surface px-4 py-3 rounded-l-lg border border-r-0 border-border">/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="sobre-nosotros"
                className="w-full bg-background border border-border rounded-r-lg px-4 py-3 text-lg focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-xl border border-border bg-yellow-500/5 border-yellow-500/20">
          <h3 className="text-yellow-500 font-bold mb-2">💡 Uso de Códigos Cortos (Shortcodes)</h3>
          <p className="text-sm text-gray-400">Puedes usar los siguientes códigos en el editor HTML para insertar contenido dinámico:</p>
          <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
            <li><code>[latest-news]</code> - Muestra una grilla con las últimas noticias publicadas.</li>
            <li><code>[banner:home]</code> - Muestra el anuncio rotativo configurado para la portada.</li>
          </ul>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-bold">Contenido de la Página</label>
            <div className="flex bg-surface border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setEditorMode('visual')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${editorMode === 'visual' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Visual (Editor)
              </button>
              <button
                onClick={() => setEditorMode('html')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${editorMode === 'html' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Código HTML
              </button>
            </div>
          </div>
          
          {editorMode === 'visual' ? (
            <RichTextEditor content={content} onChange={setContent} />
          ) : (
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[500px] bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm p-6 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="<!-- Pega tu código HTML, iframes o scripts aquí -->"
                spellCheck="false"
              />
              <p className="text-xs text-yellow-500 mt-2">
                ⚠️ Al cambiar de vuelta a "Visual", el editor podría limpiar algunas etiquetas HTML avanzadas o iframes por seguridad. Si usas HTML complejo, mantén y guarda la página en modo Código.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
