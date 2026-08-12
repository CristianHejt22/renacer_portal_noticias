"use client";

import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Share2, Download, Type, LayoutTemplate, Image as ImageIcon, Briefcase, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function GeneratorClient({ posts, sponsors = [] }) {
  // Estados Globales
  const [selectedPostId, setSelectedPostId] = useState('');
  
  // Estados de la Placa
  const [dimensions, setDimensions] = useState('1080x1350');
  const [themeColor, setThemeColor] = useState('#e63946');
  const [category, setCategory] = useState('DEPORTES');
  const [dateStr, setDateStr] = useState('');
  const [title, setTitle] = useState('Escribe tu titular aquí...');
  
  const [bgImage, setBgImage] = useState('https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2069&auto=format&fit=crop');
  const [imgFit, setImgFit] = useState('cover');
  const [imgPosY, setImgPosY] = useState(20);
  const [imgZoom, setImgZoom] = useState(100);

  const [portalLogo, setPortalLogo] = useState('');
  const [portalLogoSize, setPortalLogoSize] = useState(40);
  const [sponsorLogo, setSponsorLogo] = useState('');
  const [sponsorLogoSize, setSponsorLogoSize] = useState(70);

  const [isGenerating, setIsGenerating] = useState(false);
  
  const placaRef = useRef(null);
  const titleRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const containerRef = useRef(null);

  const currentWidth = parseInt(dimensions.split('x')[0]);
  const currentHeight = parseInt(dimensions.split('x')[1]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const availableWidth = containerRef.current.clientWidth - 40; // 40px padding
        const scale = Math.min(1, availableWidth / currentWidth);
        setPreviewScale(scale);
      }
    };
    
    updateScale();
    // Pequeño timeout para asegurar que el contenedor se montó con sus dimensiones
    setTimeout(updateScale, 100);
    
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [currentWidth, dimensions]);

  // Alturas base para el título
  const titleBaseSizes = { '1080': 58, '1350': 64, '1920': 72 };
  const textWrapperHeights = { '1080': 40, '1350': 40, '1920': 35 };

  useEffect(() => {
    // Inicializar fecha
    const dateObj = new Date();
    const options = { weekday: 'long', day: '2-digit', month: 'long' };
    const initialDate = new Intl.DateTimeFormat('es-AR', options).format(dateObj).toUpperCase();
    setDateStr(initialDate);
  }, []);

  // Función Mágica de Autoajuste de Texto
  useEffect(() => {
    if (titleRef.current) {
      let baseSize = titleBaseSizes[currentHeight.toString()] || 58;
      titleRef.current.style.fontSize = baseSize + 'px';
      
      setTimeout(() => {
        if (!titleRef.current) return;
        // Altura del wrapper de texto menos el header de fecha
        const textWrapper = titleRef.current.parentElement;
        if (!textWrapper) return;
        
        let maxH = textWrapper.clientHeight - 190;
        let currentSize = baseSize;
        
        while (titleRef.current.scrollHeight > maxH && currentSize > 30) {
          currentSize -= 2;
          titleRef.current.style.fontSize = currentSize + 'px';
        }
      }, 50);
    }
  }, [title, currentHeight]);

  const autoSelectColor = (catName) => {
    let cat = catName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let targetColor = '#e63946'; // default rojo

    if(cat.includes('deporte') || cat.includes('futbol')) targetColor = '#3b82f6';
    else if(cat.includes('alerta') || cat.includes('servicio') || cat.includes('transito')) targetColor = '#f59e0b';
    else if(cat.includes('economia') || cat.includes('salud') || cat.includes('clima')) targetColor = '#10b981';
    else if(cat.includes('espectaculo') || cat.includes('musica') || cat.includes('television') || cat.includes('serie')) targetColor = '#8b5cf6';
    else if(cat.includes('politica') || cat.includes('sociedad') || cat.includes('lifestyle')) targetColor = '#64748b';
    
    setThemeColor(targetColor);
  };

  const handlePostSelection = (e) => {
    const postId = e.target.value;
    setSelectedPostId(postId);

    if (postId) {
      const post = posts.find(p => String(p.id) === String(postId));
      if (post) {
        setTitle(post.title);
        setCategory(post.category);
        if (post.imageUrl) {
          // Utilizar wsrv.nl como proxy para imágenes para evitar problemas de CORS con html2canvas
          // Solo si es una URL válida
          if (post.imageUrl.startsWith('http')) {
            setBgImage(`https://wsrv.nl/?url=${encodeURIComponent(post.imageUrl)}`);
          } else {
            setBgImage(post.imageUrl); // Si es relativa o base64
          }
        }
        
        const dateObj = new Date(post.date);
        const options = { weekday: 'long', day: '2-digit', month: 'long' };
        setDateStr(new Intl.DateTimeFormat('es-AR', options).format(dateObj).toUpperCase());
        
        autoSelectColor(post.category);
        toast.success("Noticia cargada correctamente");
      }
    }
  };

  const getHashtags = (catStr) => {
    let cat = catStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let tags = "";
    
    if(cat.includes('local')) tags = '#NoticiasLocales #Actualidad #Ciudad';
    else if(cat.includes('mundo')) tags = '#NoticiasDelMundo #Internacionales #Global';
    else if(cat.includes('nacional')) tags = '#NoticiasNacionales #Pais #ActualidadArgentina';
    else if(cat.includes('deporte')) tags = '#Deportes #Sports #Competencia';
    else if(cat.includes('serie') || cat.includes('pelicula')) tags = '#Series #Peliculas #Cine #Streaming #Entretenimiento';
    else if(cat.includes('musica')) tags = '#Musica #Lanzamientos #Artistas';
    else if(cat.includes('salud')) tags = '#Salud #Bienestar #VidaSana #Medicina';
    else if(cat.includes('television') || cat.includes('tv')) tags = '#Television #TV #Programas #PantallaChica';
    else if(cat.includes('lifestyle') || cat.includes('estilo')) tags = '#Lifestyle #EstiloDeVida #Tendencias #Moda';
    else if(cat.includes('politica')) tags = '#Politica #Gobierno #Debate #Elecciones';
    else if(cat.includes('sociedad')) tags = '#Sociedad #Comunidad #Gente';
    else if(cat.includes('economia') || cat.includes('finanza')) tags = '#Economia #Finanzas #Mercados #Negocios';
    else if(cat.includes('espectaculo')) tags = '#Espectaculos #Farándula #Cultura #Show';
    else if(cat.includes('alerta') || cat.includes('servicio')) tags = '#Alertas #Servicios #Atencion #Precaucion';
    else if(cat.includes('clima') || cat.includes('tiempo')) tags = '#Clima #Pronostico #Tiempo #Meteorologia';
    else tags = '#Actualidad #Noticias #UltimoMomento';

    return `${tags} #bahiablanca #BahiaBlanca #Argentina #LibreCielo`;
  };

  const capturePlaca = async () => {
    if (!placaRef.current) return null;
    
    const element = placaRef.current;
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 1, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#111111',
        width: currentWidth,
        height: currentHeight
      });
      return canvas;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setter(url);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const canvas = await capturePlaca();
      if (!canvas) throw new Error("No se pudo renderizar");
      
      const link = document.createElement('a');
      link.download = `placa-librecielo-${currentWidth}x${currentHeight}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
      toast.success("Placa descargada exitosamente");
    } catch(err) {
      toast.error('Hubo un error al generar la imagen. Revisa la conexión o las URLs de imágenes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (platform) => {
    const toastId = toast.loading(`Preparando publicación para ${platform}...`);
    try {
      const canvas = await capturePlaca();
      if (!canvas) throw new Error("Canvas error");
      
      const hashtags = getHashtags(category);
      let postText = `🔴 ${category}\n\n${title}\n\nMás información en librecielo.com`;
      
      if (platform === 'facebook' || platform === 'instagram') {
        postText += `\n.\n.\n.\n${hashtags}`;
      } else {
        postText += `\n\n#bahiablanca #LibreCielo`;
      }

      // Descargar Imagen
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `librecielo_${platform}.jpg`, { type: "image/jpeg" });
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();

        // Copiar al portapapeles
        try { 
            await navigator.clipboard.writeText(postText);
            toast.success("¡Imagen descargada y texto copiado al portapapeles!", { id: toastId });
        } catch(e) { 
            toast.success("Imagen descargada. Usa Ctrl+V para pegar el texto si se copió.", { id: toastId });
        }
      }, 'image/jpeg', 0.95);

    } catch(err) {
      toast.error("Error al procesar para compartir", { id: toastId });
    }
  };

  // Cálculo de alturas
  const hText = textWrapperHeights[currentHeight.toString()] || 40;
  const hImg = 100 - hText;

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap');
        
        .placa-container {
            font-family: 'Montserrat', sans-serif;
            background-color: #111111;
            position: relative;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        
        .placa-container * {
            box-sizing: border-box;
        }

        .category-tag {
            font-weight: 700;
            font-size: 24px;
            text-transform: uppercase;
            padding: 10px 20px;
            display: inline-block;
            letter-spacing: 2px;
            border-radius: 6px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
      `}} />

      {/* PANEL DE CONTROLES */}
      <div className="flex-1 w-full xl:max-w-[420px] bg-card rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col">
        
        <div className="p-5 border-b border-border bg-muted/30">
          <label className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-2">
            <RefreshCcw size={16} /> Autocompletar desde Noticias
          </label>
          <select 
            value={selectedPostId}
            onChange={handlePostSelection}
            className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">-- Seleccionar Noticia --</option>
            {posts.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-foreground/80">
            <LayoutTemplate size={16} /> Estructura
          </h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2">Formato de Exportación</label>
            <select 
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-sm"
            >
              <option value="1080x1080">Post Cuadrado (1080 x 1080)</option>
              <option value="1080x1350">Instagram Vertical (1080 x 1350)</option>
              <option value="1080x1920">Historia / Reel (1080 x 1920)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2">Tema de Alerta</label>
            <div className="flex gap-3">
              {[
                { color: '#e63946', label: 'Rojo' },
                { color: '#3b82f6', label: 'Azul' },
                { color: '#f59e0b', label: 'Naranja' },
                { color: '#10b981', label: 'Verde' },
                { color: '#8b5cf6', label: 'Violeta' },
                { color: '#64748b', label: 'Gris' },
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setThemeColor(c.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${themeColor === c.color ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-foreground/80">
            <Type size={16} /> Contenido Textual
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Etiqueta / Categoría</label>
              <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Fecha (Editable)</label>
              <input type="text" value={dateStr} onChange={e => setDateStr(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Titular Principal</label>
              <textarea rows={3} value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-sm resize-none" />
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-foreground/80">
            <ImageIcon size={16} /> Multimedia Avanzada
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">URL Fotografía de Fondo</label>
              <input type="text" value={bgImage} onChange={e => setBgImage(e.target.value)} className="w-full bg-background border border-border rounded-lg p-2.5 text-sm" />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-2 text-muted-foreground flex justify-between">Posición Y <span>{imgPosY}%</span></label>
                <input type="range" min="0" max="100" value={imgPosY} onChange={e => setImgPosY(e.target.value)} className="w-full accent-primary" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-2 text-muted-foreground flex justify-between">Zoom <span>{imgZoom}%</span></label>
                <input type="range" min="100" max="250" value={imgZoom} onChange={e => setImgZoom(e.target.value)} className="w-full accent-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 text-foreground/80">
            <Briefcase size={16} /> Branding & Sponsors
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2">Logo Portal (Dejar vacío = Texto)</label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={portalLogo} onChange={e => setPortalLogo(e.target.value)} placeholder="URL PNG transparente" className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm" />
                <label className="bg-primary text-primary-foreground rounded-lg px-3 flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors" title="Subir desde PC">
                  <ImageIcon size={16} />
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileUpload(e, setPortalLogo)} />
                </label>
              </div>
              <input type="range" min="20" max="100" value={portalLogoSize} onChange={e => setPortalLogoSize(e.target.value)} className="w-full accent-primary" title="Tamaño Logo Portal" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2">Sponsor Oficial (Arriba Der.)</label>
              <select 
                onChange={(e) => setSponsorLogo(e.target.value)}
                className="w-full bg-background border border-border rounded-lg p-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">-- Seleccionar Plan Publicitario --</option>
                {sponsors.map(s => (
                  <option key={s.id} value={s.imageUrl}>{s.name}</option>
                ))}
              </select>
              <div className="flex gap-2 mb-2">
                <input type="text" value={sponsorLogo} onChange={e => setSponsorLogo(e.target.value)} placeholder="O ingresa URL / Sube archivo" className="flex-1 bg-background border border-border rounded-lg p-2.5 text-sm" />
                <label className="bg-primary text-primary-foreground rounded-lg px-3 flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors" title="Subir desde PC">
                  <ImageIcon size={16} />
                  <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => handleFileUpload(e, setSponsorLogo)} />
                </label>
              </div>
              <input type="range" min="30" max="200" value={sponsorLogoSize} onChange={e => setSponsorLogoSize(e.target.value)} className="w-full accent-primary" title="Tamaño Logo Sponsor" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-muted/30">
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCcw className="animate-spin" /> : <Download />}
            {isGenerating ? 'GENERANDO...' : 'EXPORTAR PLACA'}
          </button>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button onClick={() => handleShare('whatsapp')} className="bg-[#25D366] text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-[#1da851] transition-colors">
               WhatsApp
            </button>
            <button onClick={() => handleShare('facebook')} className="bg-[#1877F2] text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:bg-[#1464c9] transition-colors">
              Facebook
            </button>
            <button onClick={() => handleShare('instagram')} className="col-span-2 bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 hover:opacity-90 transition-opacity">
              Publicar en Instagram
            </button>
          </div>
        </div>
      </div>

      {/* VISTA PREVIA (WORKSPACE) */}
      <div 
        ref={containerRef}
        className="flex-1 w-full bg-[#000] p-4 md:p-8 rounded-2xl shadow-2xl flex items-start justify-center overflow-hidden min-h-[500px]"
      >
        {/* Contenedor Escalable Responsivo Visual */}
        <div 
          style={{ 
            transform: `scale(${previewScale})`, 
            transformOrigin: 'top center', 
            width: `${currentWidth}px`, 
            height: `${currentHeight}px`,
            transition: 'transform 0.15s ease-out'
          }}
          className="relative flex justify-center"
        >
          {/* PLACA REAL (Siempre 100% de tamaño internamente) */}
          <div 
            ref={placaRef}
            className="placa-container"
            style={{ 
              width: `${currentWidth}px`, 
              height: `${currentHeight}px`,
            }}
          >
            {/* SPONSOR */}
            {sponsorLogo && (
              <div style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 10 }}>
                <img 
                  crossOrigin="anonymous" 
                  src={sponsorLogo.startsWith('blob:') || sponsorLogo.startsWith('data:') || !sponsorLogo.startsWith('http') ? sponsorLogo : `https://wsrv.nl/?url=${encodeURIComponent(sponsorLogo)}`} 
                  alt="Sponsor" 
                  style={{ maxHeight: `${sponsorLogoSize}px`, objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
                />
              </div>
            )}

            {/* IMAGEN DE FONDO */}
            <div style={{ width: '100%', height: `${hImg}%`, position: 'relative', overflow: 'hidden', backgroundColor: '#050505' }}>
              <img 
                crossOrigin="anonymous" 
                src={bgImage || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='} 
                alt="Fondo" 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: imgFit, 
                  objectPosition: `center ${imgPosY}%`,
                  transform: `scale(${imgZoom / 100})`
                }} 
              />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', background: 'linear-gradient(to bottom, rgba(17,17,17,0) 0%, rgba(17,17,17,1) 100%)', pointerEvents: 'none' }}></div>
            </div>

            {/* CONTENIDO TEXTUAL */}
            <div style={{ height: `${hText}%`, padding: '0 60px 60px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: '#111111', position: 'relative' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', marginTop: '-20px', zIndex: 2, position: 'relative' }}>
                <div className="category-tag" style={{ backgroundColor: themeColor, color: '#ffffff' }}>
                  {category || 'NOTICIA'}
                </div>
                <div style={{ color: '#a3a3a3', fontSize: '20px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ width: '22px', height: '22px', fill: themeColor }} viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
                  <span>{dateStr}</span>
                </div>
              </div>
              
              <h1 ref={titleRef} style={{ color: '#ffffff', fontSize: '58px', fontWeight: 900, lineHeight: 1.15, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', textWrap: 'balance' }}>
                {title}
              </h1>
            </div>

            {/* FOOTER */}
            <div style={{ position: 'absolute', bottom: '40px', left: '60px', display: 'flex', alignItems: 'center', width: 'calc(100% - 120px)' }}>
              {portalLogo && (
                <img 
                  crossOrigin="anonymous" 
                  src={portalLogo.startsWith('blob:') || portalLogo.startsWith('data:') || !portalLogo.startsWith('http') ? portalLogo : `https://wsrv.nl/?url=${encodeURIComponent(portalLogo)}`} 
                  alt="Logo Portal" 
                  style={{ maxHeight: `${portalLogoSize}px`, objectFit: 'contain', marginRight: '15px' }} 
                />
              )}
              
              <div style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
                Libre<span style={{ color: themeColor }}>Cielo</span>.com
              </div>
              <div style={{ height: '4px', width: '80px', backgroundColor: themeColor, marginLeft: '20px', borderRadius: '2px' }}></div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
