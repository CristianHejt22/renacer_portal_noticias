'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

export default function BannerDisplay({ position = 'in-article', specificId = null }) {
  const [banners, setBanners] = useState([]);
  const [hasViewed, setHasViewed] = useState(false);
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
          const activeBanners = Array.isArray(data.data) ? data.data : [data.data];
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

  if (banners.length === 0) return null;

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center gap-4 my-8">
      {banners.map(banner => (
        <a 
          key={banner.id}
          href={`/api/banner/click?id=${banner.id}&url=${encodeURIComponent(banner.targetUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full max-w-4xl mx-auto overflow-hidden rounded-xl border border-border hover:opacity-95 transition-opacity"
        >
          <img src={banner.imageUrl} alt={banner.name} className="w-full h-auto object-contain max-h-[400px]" />
        </a>
      ))}
    </div>
  );
}
