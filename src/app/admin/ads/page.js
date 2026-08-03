'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, Sparkles, CheckCircle2, Globe, Layout, Smartphone } from 'lucide-react';
import { saveAdSettings, getAdSettings } from '@/app/actions/settings';

export default function AdsSettingsPage() {
  const [adsenseClientId, setAdsenseClientId] = useState('ca-pub-5460050326198241');
  const [adsenseSidebarSlot, setAdsenseSidebarSlot] = useState('');
  const [adsenseInArticleSlot, setAdsenseInArticleSlot] = useState('');
  const [adsenseEnabled, setAdsenseEnabled] = useState(true);

  const [headScript, setHeadScript] = useState('');
  const [inArticleScript, setInArticleScript] = useState('');
  const [sidebarScript, setSidebarScript] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const res = await getAdSettings();
      if (res.success && res.data) {
        setAdsenseClientId(res.data.adsenseClientId || 'ca-pub-5460050326198241');
        setAdsenseSidebarSlot(res.data.adsenseSidebarSlot || '');
        setAdsenseInArticleSlot(res.data.adsenseInArticleSlot || '');
        setAdsenseEnabled(res.data.adsenseEnabled !== false);

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
      adsense_client_id: adsenseClientId,
      adsense_sidebar_slot: adsenseSidebarSlot,
      adsense_in_article_slot: adsenseInArticleSlot,
      adsense_enabled: adsenseEnabled ? 'true' : 'false',
      ad_head_script: headScript,
      ad_in_article_script: inArticleScript,
      ad_sidebar_script: sidebarScript,
    });
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      alert('¡Configuración de publicidad guardada correctamente!');
    } else {
      alert(res.error || 'Hubo un error al guardar');
    }
  };

  return (
    <div className="max-w-4xl pb-16">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-primary" />
            <span>Gestión de Publicidad y AdSense</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Administra Google AdSense, banners laterales y scripts publicitarios de Adsterra u otras redes.
          </p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/20 transition-all cursor-pointer"
        >
          <Save size={18} />
          <span>Guardar Cambios</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl mb-8 flex items-center gap-3">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>Cambios guardados con éxito. Los anuncios se actualizarán en el portal.</span>
        </div>
      )}

      {/* Google AdSense Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              G
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google AdSense</h2>
              <p className="text-xs text-gray-400">Integración nativa del script y espacios laterales de Google AdSense</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={adsenseEnabled} 
              onChange={(e) => setAdsenseEnabled(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              AdSense Publisher Client ID
            </label>
            <input
              type="text"
              value={adsenseClientId}
              onChange={(e) => setAdsenseClientId(e.target.value)}
              placeholder="ca-pub-5460050326198241"
              className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Script cargado automáticamente en el encabezado global: <code className="text-primary/80">https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={adsenseClientId}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Slot ID Lateral (Sidebar - Opcional)
              </label>
              <input
                type="text"
                value={adsenseSidebarSlot}
                onChange={(e) => setAdsenseSidebarSlot(e.target.value)}
                placeholder="Ej. 1234567890 (opcional)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Si está vacío, se usará el formato automático responsivo.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Slot ID Entre Artículos (In-Article - Opcional)
              </label>
              <input
                type="text"
                value={adsenseInArticleSlot}
                onChange={(e) => setAdsenseInArticleSlot(e.target.value)}
                placeholder="Ej. 0987654321 (opcional)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Inserta [adsense] en cualquier noticia para colocarlo.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-yellow-500 dark:text-yellow-400">
        <AlertCircle className="shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-0.5">Scripts de Redes Publicitarias Adicionales (Adsterra / Popunders / Banners)</p>
          <p className="text-xs text-yellow-500/80 dark:text-yellow-400/80">
            Pega aquí los códigos de formato HTML/Javascript provistos por Adsterra u otras redes.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            <span>Script Global (Head)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Se cargará en todas las páginas de la web (ideal para Popunders, Social Bar o scripts globales).</p>
          <textarea
            value={headScript}
            onChange={(e) => setHeadScript(e.target.value)}
            rows={3}
            placeholder="<script ...></script>"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Layout size={18} className="text-primary" />
            <span>Anuncio entre Párrafos (In-Article Script)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Aparecerá automáticamente en medio del texto de las publicaciones.</p>
          <textarea
            value={inArticleScript}
            onChange={(e) => setInArticleScript(e.target.value)}
            rows={3}
            placeholder="<iframe ...></iframe> o <script ...></script>"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Smartphone size={18} className="text-primary" />
            <span>Anuncio Lateral Script (Sidebar)</span>
          </h2>
          <p className="text-xs text-gray-400 mb-4">Se mostrará en las barras laterales de la versión de escritorio y móviles.</p>
          <textarea
            value={sidebarScript}
            onChange={(e) => setSidebarScript(e.target.value)}
            rows={3}
            placeholder="<iframe ...></iframe> o <script ...></script>"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
