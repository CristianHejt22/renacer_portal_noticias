'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BannerDisplay({ 
  position = 'in-article', 
  specificId = null, 
  mode = 'slider', 
  className = 'my-8', 
  hideUI = false 
}) {
  const [banners, setBanners] = useState([]);
  const [hasViewed, setHasViewed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let url = '/api/banner/active?position=' + position;
    if (specificId) {
      url = '/api/banner/active?id=' + specificId;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && data.data) {
          let activeBanners = Array.isArray(data.data) ? [...data.data] : [data.data];
          activeBanners = activeBanners.filter(b => b && b.imageUrl);
          // Shuffle array so starting ad is randomized on each load
          for (let i = activeBanners.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeBanners[i], activeBanners[j]] = [activeBanners[j], activeBanners[i]];
          }
          setBanners(activeBanners);
        }
      })
      .catch(err => console.error('Banner fetch error:', err));

    return () => {
      isMounted = false;
    };
  }, [position, specificId]);

  useEffect(() => {
    if (banners.length === 0 || hasViewed || !containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0] && entries[0].isIntersecting) {
        banners.forEach(banner => {
          if (banner.id) {
            fetch(`/api/banner/view?id=${banner.id}`).catch(() => {});
          }
        });
        setHasViewed(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [banners, hasViewed]);

  useEffect(() => {
    if (mode === 'slider' && banners.length > 1) {
      const currentDuration = Math.max(banners[currentIndex]?.duration || 5, 2) * 1000;
      const timeoutId = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, currentDuration);
      return () => clearTimeout(timeoutId);
    }
  }, [banners, mode, currentIndex]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];
  const hasTargetUrl = Boolean(currentBanner?.targetUrl && currentBanner.targetUrl.trim() !== '' && currentBanner.targetUrl !== '#');
  const clickHref = hasTargetUrl 
    ? `/api/banner/click?id=${currentBanner.id}&url=${encodeURIComponent(currentBanner.targetUrl.trim())}` 
    : undefined;

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div ref={containerRef} className={`w-full flex flex-col items-center gap-2 ${className}`}>
      {!hideUI && (
        <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded select-none">
          Publicidad
        </span>
      )}
      
      {mode === 'slider' ? (
        <div className="relative group w-full max-w-4xl mx-auto">
          {hasTargetUrl ? (
            <a 
              key={currentBanner.id}
              href={clickHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full overflow-hidden rounded-xl border border-border/80 hover:border-primary/50 hover:opacity-95 transition-all shadow-md bg-black/20"
            >
              <img 
                src={currentBanner.imageUrl} 
                alt={currentBanner.name || 'Publicidad'} 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[380px] mx-auto select-none" 
              />
            </a>
          ) : (
            <div 
              key={currentBanner.id}
              className="block w-full overflow-hidden rounded-xl border border-border/80 shadow-md bg-black/20"
            >
              <img 
                src={currentBanner.imageUrl} 
                alt={currentBanner.name || 'Publicidad'} 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[380px] mx-auto select-none" 
              />
            </div>
          )}

          {/* Slider Navigation Arrows on Hover (if multiple banners) */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-90 transition-all duration-200 hover:scale-105 z-10"
                aria-label="Anuncio anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/70 hover:bg-primary text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-90 transition-all duration-200 hover:scale-105 z-10"
                aria-label="Siguiente anuncio"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      ) : (
        banners.map(banner => {
          const bannerHasUrl = Boolean(banner?.targetUrl && banner.targetUrl.trim() !== '' && banner.targetUrl !== '#');
          const bannerHref = bannerHasUrl 
            ? `/api/banner/click?id=${banner.id}&url=${encodeURIComponent(banner.targetUrl.trim())}` 
            : undefined;

          return bannerHasUrl ? (
            <a 
              key={banner.id}
              href={bannerHref}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border hover:border-primary/50 hover:opacity-95 transition-all mb-4 shadow-md bg-black/20"
            >
              <img 
                src={banner.imageUrl} 
                alt={banner.name || 'Publicidad'} 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[380px] mx-auto select-none" 
              />
            </a>
          ) : (
            <div 
              key={banner.id}
              className="block w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border mb-4 shadow-md bg-black/20"
            >
              <img 
                src={banner.imageUrl} 
                alt={banner.name || 'Publicidad'} 
                referrerPolicy="no-referrer"
                className="w-full h-auto object-contain max-h-[380px] mx-auto select-none" 
              />
            </div>
          );
        })
      )}

      {!hideUI && mode === 'slider' && banners.length > 1 && (
        <div className="flex gap-2 mt-1 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex 
                  ? 'bg-primary w-5 shadow-sm' 
                  : 'bg-gray-500/50 hover:bg-gray-400 w-2'
              }`}
              aria-label={`Ir al anuncio ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
