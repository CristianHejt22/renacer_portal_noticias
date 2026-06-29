'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BannerDisplay({ position = 'in-article', specificId = null }) {
  const [banners, setBanners] = useState([]);

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
          // If specificId, it might return an array with one element or we just use it
          const activeBanners = Array.isArray(data.data) ? data.data : [data.data];
          setBanners(activeBanners);
          
          // Registrar vista
          activeBanners.forEach(banner => {
            fetch(`/api/banner/view?id=${banner.id}`);
          });
        }
      })
      .catch(err => console.error(err));
  }, [position, specificId]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center gap-4 my-8">
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
