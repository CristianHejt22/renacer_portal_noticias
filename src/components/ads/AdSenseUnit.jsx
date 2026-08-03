'use client';

import { useEffect, useRef } from 'react';

export default function AdSenseUnit({
  client = 'ca-pub-5460050326198241',
  slot = '',
  format = 'auto',
  responsive = 'true',
  layout = '',
  layoutKey = '',
  style = { display: 'block' },
  className = '',
  minHeight = '250px'
}) {
  const adRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    // Only push once per mount to prevent multiple push errors on re-renders
    if (pushedRef.current) return;
    
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushedRef.current = true;
      }
    } catch (e) {
      console.warn('AdSense unit error:', e);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden text-center my-4 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded mb-2 inline-block font-semibold">
        Publicidad
      </span>
      <div 
        style={{ minHeight }} 
        className="w-full flex items-center justify-center bg-slate-900/10 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-2 overflow-hidden"
      >
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={style}
          data-ad-client={client}
          {...(slot ? { 'data-ad-slot': slot } : {})}
          {...(format ? { 'data-ad-format': format } : {})}
          {...(responsive ? { 'data-full-width-responsive': responsive } : {})}
          {...(layout ? { 'data-ad-layout': layout } : {})}
          {...(layoutKey ? { 'data-ad-layout-key': layoutKey } : {})}
        />
      </div>
    </div>
  );
}
