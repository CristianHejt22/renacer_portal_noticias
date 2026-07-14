'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Image from 'next/image';

export default function PWAInstallPrompt({ siteLogo, siteName }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Escuchar el evento de instalación disponible
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Mostrar el prompt solo si no fue cerrado recientemente (evitar spam)
      const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!isDismissed) {
        // Retrasar un poco la aparición para no molestar inmediatamente al entrar
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Ocultar nuestro prompt UI
    setShowPrompt(false);
    
    // Mostrar el prompt nativo del navegador
    deferredPrompt.prompt();
    
    // Esperar a la decisión del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Limpiar el deferredPrompt para que no se pueda usar de nuevo
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage por 7 días para no molestar
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwa_prompt_dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 p-4 md:p-6 pb-24 md:pb-6 pointer-events-none flex justify-center">
      <div className="bg-surface border border-primary/30 shadow-2xl shadow-primary/20 rounded-2xl p-4 w-full max-w-md pointer-events-auto relative overflow-hidden flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo */}
        <div className="relative w-12 h-12 flex-shrink-0 bg-background rounded-xl overflow-hidden border border-border">
          <Image 
            src={siteLogo || '/icon-192x192.png'} 
            alt={siteName || 'App'} 
            fill 
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div className="flex-grow pr-6">
          <h4 className="font-bold text-foreground text-sm">Instalar {siteName}</h4>
          <p className="text-xs text-gray-400 mt-0.5">Acceso más rápido y sin conexión.</p>
        </div>

        {/* Install Button */}
        <button 
          onClick={handleInstallClick}
          className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Instalar
        </button>
      </div>
    </div>
  );
}
