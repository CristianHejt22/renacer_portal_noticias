'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function BannerDisplay({ position = 'in-article', specificId = null, mode = 'slider', className = 'my-8', hideUI = false }) {
  const [banners, setBanners] = useState([]);
  const [hasViewed, setHasViewed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch banners
    let url = '/api/banner/active?position=' + position;
    if (specificId) {
      url = '/api/banner/active?id=' + specificId;
    }
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          let activeBanners = Array.isArray(data.data) ? [...data.data] : [data.data];
          // Shuffle array so the starting ad is random on each page load
          for (let i = activeBanners.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeBanners[i], activeBanners[j]] = [activeBanners[j], activeBanners[i]];
          }
          setBanners(activeBanners);
        }
      })
      .catch(err => console.error(err));
  }, [position, specificId]);

  useEffect(() => {
    if (banners.length === 0 || hasViewed || !containerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        banners.forEach(banner => {
          fetch(`/api/banner/view?id=${banner.id}`).catch(() => {});
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
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length, mode]);

  if (banners.length === 0) return null;

  return (
    <div ref={containerRef} className={`w-full flex flex-col items-center gap-2 ${className}`}>
      {!hideUI && (
        <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded">
          Publicidad
        </span>
      )}
      
      {mode === 'slider' ? (
        <a 
          key={banners[currentIndex].id}
          href={`/api/banner/click?id=${banners[currentIndex].id}&url=${encodeURIComponent(banners[currentIndex].targetUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border hover:opacity-95 transition-opacity"
        >
          <img 
            src={banners[currentIndex].imageUrl} 
            alt={banners[currentIndex].name} 
            className="w-full h-auto object-contain max-h-[400px]" 
          />
        </a>
      ) : (
        banners.map(banner => (
          <a 
            key={banner.id}
            href={`/api/banner/click?id=${banner.id}&url=${encodeURIComponent(banner.targetUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border hover:opacity-95 transition-opacity mb-4"
          >
            <img src={banner.imageUrl} alt={banner.name} className="w-full h-auto object-contain max-h-[400px]" />
          </a>
        ))
      )}

      {!hideUI && mode === 'slider' && banners.length > 1 && (
        <div className="flex gap-2 mt-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-4' : 'bg-gray-400'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
