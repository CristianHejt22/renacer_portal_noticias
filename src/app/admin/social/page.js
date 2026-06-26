'use client';

import { useState } from 'react';
import { Save, Hash, Users, Camera, MessageCircle } from 'lucide-react';

export default function SocialSettingsPage() {
  const [sponsorText, setSponsorText] = useState('Patrocinado por: Empresa Ejemplo');
  
  const handleSave = () => {
    alert('Configuración guardada exitosamente');
  };

  return (
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Redes Sociales y Publicación</h1>
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Save size={20} />
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

      {/* Conexiones API */}
      <section className="glass p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold mb-6">Conexiones de Auto-publicación</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg">
                <Hash size={24} />
              </div>
              <div>
                <h3 className="font-bold">X (Twitter)</h3>
                <p className="text-sm text-gray-500">Publicar tweets automáticos</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
              Conectar Cuenta
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#1877F2]/10 text-[#1877F2] rounded-lg">
                <Users size={24} />
              </div>
              <div>
                <h3 className="font-bold">Facebook Page</h3>
                <p className="text-sm text-gray-500">Publicar en tu página oficial</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
              Conectar Cuenta
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#E1306C]/10 text-[#E1306C] rounded-lg">
                <Camera size={24} />
              </div>
              <div>
                <h3 className="font-bold">Instagram</h3>
                <p className="text-sm text-gray-500">Publicar en el feed o historias</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
              Conectar Cuenta
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-lg">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold">Canal de WhatsApp</h3>
                <p className="text-sm text-gray-500">Enviar notificación a suscriptores</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-border rounded-lg hover:bg-white/10 transition-colors">
              Configurar API
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
