'use client';
import { useEffect, useRef } from 'react';

export default function AdViewTracker({ adId }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    
    // Check if we already tracked this view in the current session
    const viewedAds = JSON.parse(sessionStorage.getItem('viewedAds') || '[]');
    if (viewedAds.includes(adId)) {
      hasTracked.current = true;
      return;
    }

    // Call the API to track the view
    fetch(`/api/clasificados/${adId}/view`, { method: 'POST' })
      .then((res) => {
        if (res.ok) {
          viewedAds.push(adId);
          sessionStorage.setItem('viewedAds', JSON.stringify(viewedAds));
          hasTracked.current = true;
        }
      })
      .catch(() => {});
  }, [adId]);

  return null;
}
