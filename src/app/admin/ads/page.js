'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { saveAdSettings, getAdSettings } from '@/app/actions/settings';

export default function AdsSettingsPage() {
  const [headScript, setHeadScript] = useState('');
  const [inArticleScript, setInArticleScript] = useState('');
  const [sidebarScript, setSidebarScript] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const res = await getAdSettings();
      if (res.success && res.data) {
        setHeadScript(res.data.headScript || '');
        setInArticleScript(res.data.inArticleScript || '');
        setSidebarScript(res.data.sidebarScript || '');
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    const res = await saveAdSettings({
      ad_head_script: headScript,
      ad_in_article_script: inArticleScript,
      ad_sidebar_script: sidebarScript,
    });
    if (res.success) {
      alert('Configuración de anuncios guardada correctamente');
    } else {
      alert(res.error || 'Hubo un error al guardar');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestión de Anuncios (Adsterra)</h1>
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={20} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 flex items-start space-x-3 text-yellow-600 dark:text-yellow-400">
        <AlertCircle className="shrink-0 mt-0.5" />
        <p className="text-sm">
          Pega aquí los códigos proporcionados por Adsterra u otra plataforma publicitaria. 
          Ten cuidado de no alterar la estructura del script para evitar errores en la web.
        </p>
      </div>

      <div className="space-y-8">
        <div className="glass p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-2">Script Global (Head)</h2>
          <p className="text-sm text-gray-500 mb-4">Se cargará en todas las páginas (ideal para popunders o social bar).</p>
          <textarea
            value={headScript}
            onChange={(e) => setHeadScript(e.target.value)}
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="glass p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-2">Anuncio entre Párrafos (In-Article)</h2>
          <p className="text-sm text-gray-500 mb-4">Aparecerá automáticamente en medio del contenido de las noticias.</p>
          <textarea
            value={inArticleScript}
            onChange={(e) => setInArticleScript(e.target.value)}
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="glass p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-2">Anuncio Lateral (Sidebar / Banners)</h2>
          <p className="text-sm text-gray-500 mb-4">Se mostrará en las barras laterales de la versión de escritorio.</p>
          <textarea
            value={sidebarScript}
            onChange={(e) => setSidebarScript(e.target.value)}
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
