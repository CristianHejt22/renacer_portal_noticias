'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

// Este componente se carga globalmente, pero usa fetch internamente o recibe la data
export default function PromoPopup({ popupData }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!popupData || !popupData.isActive) return;

    const checkAndShowPopup = () => {
      try {
        const popupId = popupData.id;
        const maxViews = popupData.maxViews;
        const resetPeriod = popupData.resetPeriod; // never, daily, weekly, monthly

        // Recuperar estado del popup del localStorage
        const storageKey = `promo_popup_${popupId}`;
        const data = JSON.parse(localStorage.getItem(storageKey) || '{"views": 0, "lastSeen": null}');
        
        let views = data.views;
        let lastSeen = data.lastSeen ? new Date(data.lastSeen) : null;
        const now = new Date();

        // Lógica de reseteo
        if (lastSeen) {
          const diffTime = Math.abs(now - lastSeen);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (resetPeriod === 'daily' && diffDays >= 1) views = 0;
          if (resetPeriod === 'weekly' && diffDays >= 7) views = 0;
          if (resetPeriod === 'monthly' && diffDays >= 30) views = 0;
        }

        if (views < maxViews) {
          // Si tiene visualizaciones disponibles, mostrar con un ligero retraso para ser menos intrusivo
          const timer = setTimeout(() => {
            setShow(true);
            
            // Incrementar vistas y guardar
            localStorage.setItem(storageKey, JSON.stringify({
              views: views + 1,
              lastSeen: now.toISOString()
            }));
          }, 3000); // Aparece a los 3 segundos

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error("Error managing popup state", error);
      }
    };

    checkAndShowPopup();
  }, [popupData]);

  if (!show) return null;

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShow(false);
  };

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) {
      setShow(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleWrapperClick}
    >
      <div className="relative w-full max-w-md md:max-w-lg bg-background rounded-2xl overflow-hidden shadow-2xl border border-border/50 animate-in zoom-in-95 duration-500">
        
        {/* Botón Cerrar */}
        <button 
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>

        {/* Contenido (Clickable si hay enlace) */}
        {popupData.targetUrl ? (
          <a href={popupData.targetUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full group">
            {popupData.imageUrl && (
              <img 
                src={popupData.imageUrl} 
                alt={popupData.title || "Promoción"} 
                className="w-full h-auto object-cover max-h-[70vh] group-hover:scale-105 transition-transform duration-700"
              />
            )}
            {!popupData.imageUrl && (
              <div className="p-8 text-center bg-gradient-to-br from-primary/20 to-accent/20">
                <h3 className="text-2xl font-bold">{popupData.title}</h3>
                <p className="mt-4 text-primary font-semibold">¡Haz clic para ver más!</p>
              </div>
            )}
          </a>
        ) : (
          <div className="block relative w-full">
            {popupData.imageUrl && (
              <img 
                src={popupData.imageUrl} 
                alt={popupData.title || "Promoción"} 
                className="w-full h-auto object-cover max-h-[70vh]"
              />
            )}
             {!popupData.imageUrl && (
              <div className="p-8 text-center bg-gradient-to-br from-primary/20 to-accent/20">
                <h3 className="text-2xl font-bold">{popupData.title}</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
