'use client';

import { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import Link from 'next/link';
import { getAdSettings } from '@/app/actions/settings';

export default function BreakingNewsBar() {
  const [active, setActive] = useState(false);
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const res = await getAdSettings();
      if (res.success && res.data) {
        if (res.data.breakingNewsActive && res.data.breakingNewsText) {
          setActive(true);
          setText(res.data.breakingNewsText);
          setLink(res.data.breakingNewsLink || '');
        }
      }
    }
    fetchSettings();
  }, []);

  if (!active || closed) return null;

  const content = (
    <>
      <span className="flex bg-primary/20 p-1.5 rounded-full mr-3 shrink-0">
        <Megaphone size={16} className="text-primary animate-pulse" />
      </span>
      <p className="font-semibold text-sm md:text-base mr-6 truncate flex-1 flex items-center h-full pt-1">
        <span className="text-primary font-bold mr-2">ÚLTIMO MOMENTO:</span>
        {text}
      </p>
    </>
  );

  return (
    <div className="bg-red-950 text-white relative z-50 border-b border-red-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {link ? (
          <Link href={link} className="flex-1 flex items-center hover:opacity-80 transition-opacity">
            {content}
          </Link>
        ) : (
          <div className="flex-1 flex items-center">
            {content}
          </div>
        )}
        <button 
          onClick={() => setClosed(true)}
          className="text-white/60 hover:text-white transition-colors shrink-0 p-1"
          title="Cerrar alerta"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
