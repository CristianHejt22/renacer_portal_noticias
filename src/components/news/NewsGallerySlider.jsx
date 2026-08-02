'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink,
  Images
} from 'lucide-react';

export default function NewsGallerySlider({ 
  coverImage, 
  images = [], 
  title = 'Imagen de la noticia',
  sponsorWatermark = null 
}) {
  // Combine cover image with any additional images and filter out duplicates or empties
  const allImages = Array.from(
    new Set([coverImage, ...(images || [])].filter(Boolean))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const hasMultiple = allImages.length > 1;

  const nextImage = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
    setZoomLevel(1);
  }, [allImages.length]);

  const prevImage = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    setZoomLevel(1);
  }, [allImages.length]);

  const openLightbox = (e, index = 0) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex(index);
    setZoomLevel(1);
    setIsLightboxOpen(true);
  };

  const closeLightbox = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsLightboxOpen(false);
    setZoomLevel(1);
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen, nextImage, prevImage]);

  if (allImages.length === 0) return null;

  const currentImage = allImages[currentIndex] || allImages[0];

  return (
    <div className="w-full mb-8 select-none">
      {/* Main Slider Container */}
      <div className="relative w-full h-[360px] sm:h-[450px] md:h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
        
        {/* Blurred Background Layer */}
        <img 
          src={currentImage} 
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl scale-110 transition-all duration-700 pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Contained Image with click to open */}
        <div 
          onClick={(e) => openLightbox(e, currentIndex)}
          className="relative w-full h-full cursor-zoom-in flex items-center justify-center p-2 sm:p-4"
        >
          <img 
            src={currentImage} 
            alt={`${title} - Foto ${currentIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>

        {/* Sponsor Watermark if available */}
        {sponsorWatermark}

        {/* Top Floating Controls Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          {/* Badge: Gallery counter or Single Photo badge */}
          <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
            <Images size={14} className="text-primary" />
            <span>{hasMultiple ? `Galería: ${currentIndex + 1} de ${allImages.length}` : 'Fotografía'}</span>
          </div>

          {/* Fullscreen Expand Button */}
          <button
            type="button"
            onClick={(e) => openLightbox(e, currentIndex)}
            className="pointer-events-auto p-2.5 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md border border-white/10 transition-all duration-200 shadow-lg hover:scale-105"
            title="Abrir imagen en pantalla completa"
            aria-label="Abrir imagen en pantalla completa"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Slider Navigation Arrows (shown if multiple images) */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur-md border border-white/10 transition-all duration-200 shadow-xl opacity-90 hover:opacity-100 hover:scale-110 z-10"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-primary text-white backdrop-blur-md border border-white/10 transition-all duration-200 shadow-xl opacity-90 hover:opacity-100 hover:scale-110 z-10"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Slider Indicator Dots (at the bottom of main view) */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`pointer-events-auto h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-6 bg-primary shadow-md' 
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip (below main slider) */}
      {hasMultiple && (
        <div className="flex gap-2.5 mt-3 overflow-x-auto pb-2 no-scrollbar">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                idx === currentIndex
                  ? 'border-primary ring-2 ring-primary/40 scale-105 opacity-100'
                  : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
              } bg-slate-900`}
            >
              <img 
                src={img} 
                alt={`Miniatura ${idx + 1}`} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Modal Header */}
          <div 
            className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm sm:text-base">
                {title}
              </span>
              <span className="text-xs text-gray-400 bg-white/10 px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {allImages.length}
              </span>
            </div>

            {/* Lightbox Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.min(z + 0.3, 3));
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Ampliar zoom"
              >
                <ZoomIn size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((z) => Math.max(z - 0.3, 0.7));
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Reducir zoom"
              >
                <ZoomOut size={18} />
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomLevel(1);
                  }}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Restablecer tamaño"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              <a
                href={currentImage}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Abrir imagen original"
              >
                <ExternalLink size={18} />
              </a>
              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors ml-2"
                title="Cerrar (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Main Image Area */}
          <div 
            className="relative flex-1 flex items-center justify-center p-4 overflow-hidden"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox(e);
            }}
          >
            <div 
              className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={currentImage} 
                alt={`${title} - Vista completa ${currentIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-[92vw] max-h-[75vh] object-contain rounded-lg shadow-2xl select-none"
              />
            </div>

            {/* Navigation Arrows inside Lightbox */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md border border-white/20 transition-all duration-200 shadow-2xl hover:scale-110 z-20"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md border border-white/20 transition-all duration-200 shadow-2xl hover:scale-110 z-20"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Modal Bottom Thumbnail Bar */}
          {hasMultiple && (
            <div 
              className="px-4 py-3 bg-black/60 backdrop-blur-md border-t border-white/10 flex justify-center gap-2 overflow-x-auto no-scrollbar z-20"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentIndex(idx);
                    setZoomLevel(1);
                  }}
                  className={`relative flex-shrink-0 w-14 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    idx === currentIndex
                      ? 'border-primary ring-2 ring-primary/50 scale-105 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Miniatura ${idx + 1}`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
