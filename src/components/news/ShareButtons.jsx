'use client';

import { Link as LinkIcon } from 'lucide-react';

export default function ShareButtons({ url, title }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert('¡Enlace copiado al portapapeles!');
  };

  return (
    <aside className="md:w-12 flex md:flex-col gap-3 items-center md:sticky top-24 h-max">
      <a 
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        title="Compartir en Facebook"
        className="p-2.5 bg-surface border border-border rounded-full hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-colors flex justify-center items-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
      </a>
      
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
        title="Compartir en X (Twitter)"
        className="p-2.5 bg-surface border border-border rounded-full hover:bg-black hover:text-white hover:border-black transition-colors flex justify-center items-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
      </a>

      <a 
        href={`https://api.whatsapp.com/send?text=${encodedTitle} - ${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        title="Compartir en WhatsApp"
        className="p-2.5 bg-surface border border-border rounded-full hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors flex justify-center items-center"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
      </a>

      <button 
        onClick={handleCopy}
        title="Copiar enlace"
        className="p-2.5 bg-surface border border-border rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors flex justify-center items-center"
      >
        <LinkIcon size={18}/>
      </button>
    </aside>
  );
}
