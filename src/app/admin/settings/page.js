'use client';

import { useState, useEffect } from 'react';
import { Save, Share2 } from 'lucide-react';
import { getAdSettings, saveAdSettings } from '@/app/actions/settings';
import { getBanners } from '@/app/actions/banners';

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableSponsors, setAvailableSponsors] = useState([]);
  
  const [settings, setSettings] = useState({
    sponsorMode: 'random',
    sponsorFixedId: '',
    siteName: 'Renacer Noticias',
    siteDescription: 'Las últimas noticias de tecnología, economía y cultura.',
    siteLogo: '',
    adsenseClientId: '',
    whatsappNumber: '',
  });

  useEffect(() => {
    async function load() {
      const bannerRes = await getBanners();
      if (bannerRes.success && bannerRes.data) {
        setAvailableSponsors(bannerRes.data.filter(b => b.position === 'watermark' && b.isActive));
      }

      const res = await getAdSettings();
      if (res.success && res.data) {
        setSettings(prev => ({
          ...prev,
          sponsorMode: res.data.sponsorMode || 'random',
          sponsorFixedId: res.data.sponsorFixedId || '',
          siteName: res.data.siteName || 'Renacer Noticias',
          siteDescription: res.data.siteDescription || 'Las últimas noticias de tecnología, economía y cultura.',
          siteLogo: res.data.siteLogo || '',
          adsenseClientId: res.data.adsenseClientId || '',
          whatsappNumber: res.data.whatsappNumber || '',
        }));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleLogoUpload = () => {
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
          if (data.url) setSettings({ ...settings, siteLogo: data.url });
        } catch (err) {
          console.error(err);
          alert('Error al subir el logo');
        }
      }
    };
    input.click();
  };

  const handleSave = async () => {
    setSaving(true);
    const dataToSave = {
      'sponsor_mode': settings.sponsorMode,
      'sponsor_fixed_id': settings.sponsorFixedId,
      'site_name': settings.siteName,
      'site_description': settings.siteDescription,
      'site_logo': settings.siteLogo,
      'adsense_client_id': settings.adsenseClientId,
      'whatsapp_number': settings.whatsappNumber,
    };
    const res = await saveAdSettings(dataToSave);
    setSaving(false);
    if (res.success) {
      alert('Configuración guardada exitosamente.');
    } else {
      alert('Error: ' + res.error);
    }
  };

  if (loading) return <p>Cargando configuración...</p>;

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configuración General</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={20} />
          <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-4">Google AdSense (Monetización)</h2>
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">ID de Cliente (Auto Ads)</label>
              <input
                type="text"
                value={settings.adsenseClientId}
                onChange={(e) => setSettings({ ...settings, adsenseClientId: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ej: ca-pub-1234567890123456"
              />
              <p className="text-xs text-gray-500 mt-2">
                Introduce tu ID de cliente de AdSense. El sistema insertará el código automáticamente y Google mostrará anuncios en los mejores lugares de tu portal.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4 mt-8">Patrocinadores (Sello de Agua)</h2>
          <p className="text-sm text-gray-400 mb-4">
            Configura cómo se comportan las marcas de agua sobre las imágenes de las noticias por defecto. 
            Asegúrate de haber subido banners con la ubicación "Sello de Agua (watermark)" en la sección de Banners.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Modo de Patrocinador</label>
              <select
                value={settings.sponsorMode}
                onChange={(e) => setSettings({...settings, sponsorMode: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option value="random">Aleatorio (Rotar entre todos los sellos de agua)</option>
                <option value="fixed">Fijo (Usar siempre el mismo patrocinador)</option>
              </select>
            </div>
            
            {settings.sponsorMode === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Selecciona el Patrocinador Fijo</label>
                <select
                  value={settings.sponsorFixedId}
                  onChange={(e) => setSettings({...settings, sponsorFixedId: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="">Selecciona un patrocinador...</option>
                  {availableSponsors.map(sponsor => (
                    <option key={sponsor.id} value={sponsor.id}>{sponsor.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Publicación (RSS) Info */}
        <div className="bg-background/80 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-xl mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Share2 className="text-primary w-6 h-6" />
            <h2 className="text-xl font-bold text-gray-100 font-serif">Auto-Publicación en Redes Sociales (RSS)</h2>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <p className="text-gray-300 mb-4 leading-relaxed">
              Tu portal genera automáticamente un <strong>Feed RSS</strong> que contiene tus últimas noticias publicadas. 
              Puedes usar este enlace en plataformas como <strong>Zapier</strong> o <strong>Make.com</strong> para publicar automáticamente en Facebook, Twitter, LinkedIn o Instagram cada vez que subas una noticia nueva.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">Tu Enlace RSS (Copia esto):</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://tusitio.com/feed.xml"
                  className="flex-1 bg-background border border-border rounded-lg p-3 text-primary font-mono text-sm focus:outline-none"
                  onClick={(e) => {
                    const url = window.location.origin + '/feed.xml';
                    e.target.value = url;
                    e.target.select();
                    document.execCommand('copy');
                    alert('¡URL del RSS copiada al portapapeles!');
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Haz clic en la caja para copiar la URL real de tu sitio.</p>
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <h3 className="text-sm font-bold text-gray-300 mb-2">Instrucciones Rápidas:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                <li>Crea una cuenta gratuita en <a href="https://zapier.com" target="_blank" className="text-primary hover:underline">Zapier.com</a></li>
                <li>Haz clic en "Create a Zap".</li>
                <li>En "Trigger", busca <strong>RSS by Zapier</strong> y selecciona "New Item in Feed". Pega tu enlace RSS.</li>
                <li>En "Action", elige <strong>Facebook Pages</strong> o <strong>Twitter</strong> y selecciona "Create Page Post".</li>
                <li>¡Listo! Tu web publicará sola.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border">
          <h2 className="text-xl font-bold mb-4">Información del Sitio</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Logotipo del Portal</label>
              <div className="flex items-center space-x-4">
                {settings.siteLogo ? (
                  <div className="h-12 bg-white/10 rounded overflow-hidden flex items-center p-2">
                    <img src={settings.siteLogo} alt="Logo" className="h-full object-contain" />
                  </div>
                ) : (
                  <div className="h-12 px-4 bg-white/5 rounded border border-dashed border-gray-600 flex items-center text-sm text-gray-500">
                    Sin logo (usa texto)
                  </div>
                )}
                <button 
                  onClick={handleLogoUpload}
                  className="px-4 py-2 bg-surface border border-border rounded-lg hover:bg-white/10 transition-colors text-sm"
                >
                  Subir / Cambiar Logo
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del Portal</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Descripción del Portal</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none min-h-[100px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Número de WhatsApp (Envíanos tu noticia)</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-surface border border-border rounded-lg p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Ej: +5491123456789"
              />
              <p className="text-xs text-gray-500 mt-2">
                Agrega el número completo con código de país. Si lo llenas, aparecerá un botón flotante para que los lectores te envíen noticias directamente.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
