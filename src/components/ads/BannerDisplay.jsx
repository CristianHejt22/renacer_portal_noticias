'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BannerDisplay({ position = 'in-article' }) {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // Fetch banners
    fetch('/api/banner/active?position=' + position)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setBanners(data.data);
          
          // Registrar vista
          data.data.forEach(banner => {
            fetch(`/api/banner/view?id=${banner.id}`);
          });
        }
      })
      .catch(err => console.error(err));
  }, [position]);

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
