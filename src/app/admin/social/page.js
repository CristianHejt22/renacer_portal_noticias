'use client';

import { useState, useEffect } from 'react';
import { Save, Hash, Users, Camera, MessageCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import { getAdSettings, saveAdSettings } from '@/app/actions/settings';

export default function SocialSettingsPage() {
  const [sponsorText, setSponsorText] = useState('Patrocinado por: Empresa Ejemplo');
  const [makeWebhookUrl, setMakeWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const res = await getAdSettings();
    if (res.success && res.data) {
      setMakeWebhookUrl(res.data.makeWebhookUrl || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await saveAdSettings({
      make_webhook_url: makeWebhookUrl,
    });
    if (res.success) {
      alert('Configuración guardada exitosamente');
    } else {
      alert('Error guardando configuración');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Redes Sociales y Publicación</h1>
        <button 
          onClick={handleSave}
          disabled={loading || saving}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          <span>Guardar Configuración</span>
        </button>
      </div>

      {/* Marca / Sponsor en Imagen Principal */}
      <section className="glass p-6 rounded-xl border border-border mb-8">
        <h2 className="text-xl font-bold mb-2">Sponsor en Imágenes (Open Graph)</h2>
        <p className="text-sm text-gray-500 mb-6">
          Este texto o marca de agua se incrustará automáticamente en las imágenes al compartirse en redes sociales.
        </p>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Texto del Patrocinador</label>
          <input
            type="text"
            value={sponsorText}
            onChange={(e) => setSponsorText(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </section>

      {/* Make.com Integración */}
      <section className="glass p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold mb-2">Automatización con Make.com</h2>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa la URL del Webhook (Custom Webhook) de Make.com. Al tener esto configurado, podrás enviar noticias directamente a Make.com para publicarlas en todas tus redes (Facebook, Instagram, X).
        </p>
        
        <div className="space-y-4">
          <div className="bg-background border border-border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">URL del Webhook (Make.com)</label>
            <div className="flex">
              <div className="flex items-center justify-center px-4 bg-muted border border-r-0 border-border rounded-l-lg text-gray-500">
                <LinkIcon size={18} />
              </div>
              <input
                type="url"
                value={makeWebhookUrl}
                onChange={(e) => setMakeWebhookUrl(e.target.value)}
                placeholder="https://hook.us1.make.com/abc123def456ghi789..."
                className="flex-1 bg-background border border-border rounded-r-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
