'use client';

import { useEffect, useRef } from 'react';

export default function ScriptInjector({ htmlCode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!htmlCode || !containerRef.current) return;

    // Utilizamos createContextualFragment que parsea el HTML y ejecuta los scripts incluidos
    const fragment = document.createRange().createContextualFragment(htmlCode);
    
    // Limpiamos el contenedor y agregamos el nuevo fragmento
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(fragment);
  }, [htmlCode]);

  return <div ref={containerRef} className="hidden" />;
}
