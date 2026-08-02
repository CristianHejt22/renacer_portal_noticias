'use client';

import React, { useState, useEffect } from 'react';
import BannerDisplay from '@/components/ads/BannerDisplay';
import AdIframeInjector from '@/components/shared/AdIframeInjector';
import { Tweet } from 'react-tweet';
import { X, ZoomIn, ZoomOut, RotateCcw, ExternalLink } from 'lucide-react';

export default function ArticleContentRenderer({ 
  content = '', 
  inArticleScript = '',
  articleTitle = 'Noticia' 
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Close modal on Escape
  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  // Click handler on content to intercept img clicks
  const handleContentClick = (e) => {
    const target = e.target;
    if (target && target.tagName === 'IMG') {
      const src = target.getAttribute('src');
      if (src && !src.includes('data:image') && !src.includes('badge')) {
        setSelectedImage(src);
        setZoomLevel(1);
      }
    }
  };

  const parts = content?.split(/(\[banner:in-article\]|\[adsterra:in-article\]|\[banner:id:\d+\]|\[tweet:\d+\]|\[embed\][A-Za-z0-9+/=]+\[\/embed\])/g) || [];

  return (
    <>
      <div 
        onClick={handleContentClick}
        className="prose prose-lg dark:prose-invert max-w-none font-serif text-gray-800 dark:text-gray-200 leading-relaxed [&>div:first-child>p:first-of-type]:text-xl [&>div:first-child>p:first-of-type]:text-gray-400 [&>div:first-child>p:first-of-type]:font-medium [&>div:first-child>p:first-of-type]:mb-8 [&_img]:cursor-zoom-in [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-800 [&_img]:transition-transform hover:[&_img]:scale-[1.01]"
      >
        {parts.map((part, index) => {
          if (part === '[banner:in-article]') {
            return (
              <div key={index} className="my-8 not-prose">
                <BannerDisplay position="in-article" />
              </div>
            );
          }
          
          if (part === '[adsterra:in-article]') {
            return (
              <div key={index} className="my-8 not-prose">
                {inArticleScript && <AdIframeInjector htmlCode={inArticleScript} minHeight="250px" />}
              </div>
            );
          }

          if (part.startsWith('[banner:id:')) {
            const bannerId = part.match(/\d+/)[0];
            return (
              <div key={index} className="my-8 not-prose flex justify-center">
                <BannerDisplay position="in-article" specificId={parseInt(bannerId)} />
              </div>
            );
          }

          if (part.startsWith('[tweet:')) {
            const tweetId = part.replace('[tweet:', '').replace(']', '');
            return (
              <div key={index} className="my-8 not-prose flex justify-center w-full">
                <Tweet id={tweetId} />
              </div>
            );
          }

          if (part.startsWith('[embed]') && part.endsWith('[/embed]')) {
            const base64Content = part.replace('[embed]', '').replace('[/embed]', '');
            try {
              let decoded = '';
              if (typeof window !== 'undefined') {
                decoded = decodeURIComponent(escape(atob(base64Content)));
              } else if (typeof Buffer !== 'undefined') {
                decoded = Buffer.from(base64Content, 'base64').toString('utf-8');
              }
              
              if (decoded.trim().toLowerCase().startsWith('<iframe') && decoded.trim().toLowerCase().endsWith('</iframe>') && (decoded.match(/<iframe/ig) || []).length === 1) {
                return (
                  <div key={index} className="my-8 not-prose w-full flex justify-center">
                    <div dangerouslySetInnerHTML={{ __html: decoded }} className="w-full max-w-[800px] flex justify-center" />
                  </div>
                );
              }
              
              return (
                <div key={index} className="my-8 not-prose w-full overflow-hidden flex justify-center">
                  <AdIframeInjector htmlCode={decoded} minHeight="600px" />
                </div>
              );
            } catch (e) {
              return null;
            }
          }

          return <div key={index} dangerouslySetInnerHTML={{ __html: part }} />;
        })}
      </div>

      {/* Lightbox for in-article clicked images */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          {/* Modal Header */}
          <div 
            className="flex items-center justify-between px-4 sm:px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white font-medium text-sm sm:text-base truncate max-w-md">
              {articleTitle}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Ampliar zoom"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.7))}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Reducir zoom"
              >
                <ZoomOut size={18} />
              </button>
              {zoomLevel !== 1 && (
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Restablecer tamaño"
                >
                  <RotateCcw size={18} />
                </button>
              )}
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Abrir imagen original"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors ml-2"
                title="Cerrar (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Main Image */}
          <div 
            className="relative flex-1 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Vista completa"
                referrerPolicy="no-referrer"
                className="max-w-[92vw] max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
