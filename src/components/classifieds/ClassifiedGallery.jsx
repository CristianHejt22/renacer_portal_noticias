'use client';

import { useState } from 'react';

export default function ClassifiedGallery({ mainImage, images }) {
  const allImages = [mainImage, ...(images || [])].filter(Boolean);
  const [activeImage, setActiveImage] = useState(allImages[0]);

  if (allImages.length === 1) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square">
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${activeImage})` }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square border border-border">
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url(${activeImage})` }}
        />
      </div>
      
      {/* Thumbnails */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(img)}
            className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
              activeImage === img ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
            } bg-gray-900`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${img})` }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
