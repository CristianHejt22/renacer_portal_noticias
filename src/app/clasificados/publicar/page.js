'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClassifiedCategories } from '@/app/actions/classifiedCategories';
import { publishUserClassified, getUserCredits } from '@/app/actions/classifieds';
import { Tag, Image as ImageIcon, DollarSign, Phone, AlignLeft, Star, Send, Upload, Package } from 'lucide-react';
import Link from 'next/link';

export default function PublishClassifiedPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState({ credits: 0, featuredCredits: 0 });
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    whatsapp: '',
    city: '',
    classifiedCategoryId: '',
    plan: 'free' // 'free' | 'highlight'
  });
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadCategories();
    loadCredits();
  }, []);

  const loadCategories = async () => {
    const res = await getClassifiedCategories();
    if (res.success) setCategories(res.data);
  };

  const loadCredits = async () => {
    const { getMe } = await import('@/app/actions/auth');
    const profileRes = await getMe();
    if (profileRes.success && profileRes.data) {
      const p = profileRes.data;
      setProfile(p);
      setFormData(prev => ({
        ...prev,
        whatsapp: p.whatsapp || '',
        city: p.city || '',
      }));
    }

    const res = await getUserCredits();
    if (res.success && res.data) {
      setCredits(res.data);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (imageFiles.length + files.length > 3) {
      alert('Puedes subir un máximo de 3 imágenes.');
      return;
    }
    
    const validFiles = [];
    for (let file of files) {
      if (file.size > 8 * 1024 * 1024) {
        alert(`La imagen ${file.name} pesa más de 8MB y fue descartada.`);
      } else {
        validFiles.push(file);
      }
    }
    
    setImageFiles([...imageFiles, ...validFiles].slice(0, 3));
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/webp', 0.8);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (imageFiles.length === 0) {
      alert('Por favor selecciona al menos una imagen para tu anuncio.');
      setLoading(false);
      return;
    }

    if (formData.plan === 'free' && credits.credits <= 0) {
      alert('No tienes suficientes créditos normales.');
      setLoading(false);
      return;
    }

    if (formData.plan === 'highlight' && (credits.credits <= 0 || credits.featuredCredits <= 0)) {
      alert('No tienes suficientes créditos o destacados.');
      setLoading(false);
      return;
    }

    try {
      // 1. Subir las imágenes
      const uploadedUrls = [];
      for (let file of imageFiles) {
        // Comprimir imagen antes de subir para evitar "Payload Too Large"
        const compressedFile = await compressImage(file);

        const imgData = new FormData();
        // compressedFile is now a Blob, so we must pass the original file.name
        imgData.append('file', compressedFile, file.name || 'classified.jpg');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: imgData });
        
        if (!uploadRes.ok) {
          throw new Error(`Error al subir imagen (Status: ${uploadRes.status})`);
        }
        
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          uploadedUrls.push(uploadData.url);
        }
      }
      
      if (uploadedUrls.length === 0) {
        alert('Error al subir las imágenes.');
        setLoading(false);
        return;
      }

      // 2. Crear el clasificado descontando créditos
      const adData = {
        ...formData,
        imageUrl: uploadedUrls[0],
        images: uploadedUrls.slice(1),
        slug: generateSlug(formData.title),
      };

      const adRes = await publishUserClassified(adData);

      if (!adRes.success) {
        alert(adRes.error || 'Error al publicar el aviso');
        setLoading(false);
        return;
      }

      alert('¡Tu aviso ha sido publicado con éxito!');
      router.push('/mi-cuenta');

    } catch (error) {
      console.error(error);
      if (error.message && error.message.includes('Payload Too Large')) {
        alert('Las imágenes son demasiado pesadas. Por favor reduce su tamaño.');
      } else {
        alert('Ocurrió un error inesperado al procesar la solicitud: ' + (error.message || 'Inténtalo de nuevo.'));
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-4">Publicar Aviso</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Completa los datos para publicar tu clasificado en el portal</p>
        </div>

        {/* CREDIT BALANCES */}
        <div className="bg-surface glass border border-border rounded-xl p-4 mb-8 flex justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">Créditos Normales</span>
            <div className="flex items-center text-xl font-bold text-foreground">
              <Package className="text-primary mr-2" size={20} />
              {credits.credits} disponibles
            </div>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="flex flex-col items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">Créditos Destacados</span>
            <div className="flex items-center text-xl font-bold text-foreground">
              <Star className="text-purple-400 mr-2" size={20} />
              {credits.featuredCredits} disponibles
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface glass border border-border p-8 rounded-2xl shadow-2xl space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary border-b border-border pb-2">1. Detalles del Aviso</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del Aviso</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Tag size={18} />
                </div>
                <input 
                  type="text" required maxLength={60}
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="Ej: Vendo Auto Ford Fiesta 2018" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (Opcional, en ARS)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <DollarSign size={18} />
                  </div>
                  <input 
                    type="number" min="0" step="1"
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Ej: 1500000" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp de Contacto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="text" required readOnly={true}
                    value={formData.whatsapp} 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-border rounded-lg pl-10 p-3 text-gray-500 cursor-not-allowed outline-none" 
                    placeholder="Configúralo en Mi Cuenta" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu número se configura automáticamente desde <Link href="/mi-cuenta" className="text-primary hover:underline">Mi Cuenta</Link>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provincia y Ciudad</label>
                <div className="relative">
                  <input 
                    type="text" required readOnly={true}
                    value={formData.city} 
                    className="w-full bg-gray-100 dark:bg-white/5 border border-border rounded-lg p-3 text-gray-500 cursor-not-allowed outline-none" 
                    placeholder="Configúralo en Mi Cuenta" 
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tu ciudad se configura automáticamente desde <Link href="/mi-cuenta" className="text-primary hover:underline">Mi Cuenta</Link>.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select 
                required
                value={formData.classifiedCategoryId} 
                onChange={e => setFormData({...formData, classifiedCategoryId: e.target.value})}
                className="w-full bg-background border border-border rounded-lg p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                <option value="">-- Selecciona una categoría --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fotos (Max 3, hasta 8MB c/u)</label>
              
              <div className="flex flex-wrap gap-4 mb-2">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg border border-border bg-black/5 flex items-center justify-center overflow-hidden group">
                    <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      X
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] text-center font-bold py-0.5">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {imageFiles.length < 3 && (
                <div className="relative mt-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Upload size={18} />
                  </div>
                  <input 
                    type="file" multiple accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-background border border-border rounded-lg pl-10 p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" 
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none text-gray-500">
                  <AlignLeft size={18} />
                </div>
                <textarea 
                  required rows={5}
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="Describe todos los detalles..." 
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-semibold text-primary border-b border-border pb-2">2. Elige tu Plan (Consumirá tus Créditos)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* PLAN NORMAL */}
              <label className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col transition-all relative
                ${credits.credits > 0 
                  ? formData.plan === 'free' ? 'border-primary bg-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'border-border bg-background hover:border-gray-500' 
                  : 'opacity-50 grayscale cursor-not-allowed border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-lg ${credits.credits > 0 ? 'text-foreground' : 'text-gray-400'}`}>Anuncio Normal</span>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="free" 
                    disabled={credits.credits <= 0}
                    checked={formData.plan === 'free'}
                    onChange={() => setFormData({...formData, plan: 'free'})}
                    className="w-5 h-5 text-primary accent-primary" 
                  />
                </div>
                <p className={`text-sm flex-1 font-medium mt-2 ${formData.plan === 'free' ? 'text-foreground font-bold' : 'text-gray-500 dark:text-gray-300'}`}>
                  Aparecerá en la lista general.<br/><span className="text-primary mt-1 inline-block font-black tracking-wide bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded">Consume 1 Crédito Normal.</span>
                </p>
                {credits.credits <= 0 && <p className="text-red-400 text-xs mt-2 font-bold">No tienes créditos normales</p>}
              </label>

              {/* PLAN DESTACADO */}
              <label className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col transition-all relative overflow-hidden
                ${(credits.credits > 0 && credits.featuredCredits > 0)
                  ? formData.plan === 'highlight' ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-border bg-background hover:border-gray-500'
                  : 'opacity-50 grayscale cursor-not-allowed border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold text-lg flex items-center ${(credits.credits > 0 && credits.featuredCredits > 0) ? 'text-foreground' : 'text-gray-400'}`}>
                    <Star size={18} className="text-purple-600 dark:text-purple-400 mr-2 fill-purple-600 dark:fill-purple-400" />
                    Destacado x7 Días
                  </span>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="highlight" 
                    disabled={credits.credits <= 0 || credits.featuredCredits <= 0}
                    checked={formData.plan === 'highlight'}
                    onChange={() => setFormData({...formData, plan: 'highlight'})}
                    className="w-5 h-5 text-purple-600 dark:text-purple-500 accent-purple-600 dark:accent-purple-500" 
                  />
                </div>
                <p className={`text-sm flex-1 font-medium mt-2 ${formData.plan === 'highlight' ? 'text-foreground font-bold' : 'text-gray-500 dark:text-gray-300'}`}>
                  Aparecerá primero y resaltado.<br/><span className="text-purple-600 dark:text-purple-400 mt-1 inline-block font-black tracking-wide bg-purple-100 dark:bg-purple-500/20 px-2 py-1 rounded">Consume 1 Normal + 1 Destacado.</span>
                </p>
                {(credits.credits <= 0 || credits.featuredCredits <= 0) && <p className="text-red-400 text-xs mt-2 font-bold">Créditos insuficientes</p>}
              </label>
            </div>
          </div>

          {(credits.credits <= 0) && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-center">
              <p className="text-red-400 mb-2 font-bold">No tienes créditos suficientes para publicar.</p>
              <Link href="/paquetes" className="inline-block bg-primary text-white font-bold px-6 py-2 rounded-lg hover:bg-accent transition-colors">
                Comprar Paquetes de Créditos
              </Link>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || credits.credits <= 0 || (formData.plan === 'highlight' && credits.featuredCredits <= 0)}
            className="w-full bg-primary hover:bg-accent text-white font-bold p-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 mt-8 text-lg shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
          >
            {loading ? 'Publicando...' : (
              <>
                Publicar Ahora
                <Send size={20} className="ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
