'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getClassifiedCategories } from '@/app/actions/classifiedCategories';
import { createClassified } from '@/app/actions/classifieds';
import { createCheckout } from '@/app/actions/payments';
import { Tag, Image as ImageIcon, DollarSign, Phone, AlignLeft, Star, Send } from 'lucide-react';

export default function PublishClassifiedPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    whatsapp: '',
    classifiedCategoryId: '',
    plan: 'free' // 'free' | 'highlight'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const res = await getClassifiedCategories();
    if (res.success) setCategories(res.data);
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Create the classified ad
    const adData = {
      ...formData,
      slug: generateSlug(formData.title),
      isActive: true, // We publish it by default
    };

    const adRes = await createClassified(adData);

    if (!adRes.success) {
      alert(adRes.error || 'Error al publicar el aviso');
      setLoading(false);
      return;
    }

    // 2. Process Plan
    if (formData.plan === 'highlight') {
      // Need to checkout with Mobbex
      const checkoutRes = await createCheckout({
        userId: adRes.data.userId, // Assigned in the backend
        planId: adRes.data.id,     // We pass the Ad ID so the webhook knows what to highlight
        price: 1000,               // $1000 ARS for Highlight
        type: 'highlight'
      });

      if (checkoutRes.success) {
        // Redirect to Mobbex
        window.location.href = checkoutRes.url;
      } else {
        alert('Aviso publicado, pero hubo un error con Mobbex: ' + checkoutRes.error);
        router.push('/mi-cuenta');
      }
    } else {
      // Free plan, just go to dashboard
      router.push('/mi-cuenta');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Publicar Aviso</h1>
          <p className="text-gray-400 text-lg">Completa los datos para publicar tu clasificado en el portal</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface glass border border-border p-8 rounded-2xl shadow-2xl space-y-6">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-primary border-b border-border pb-2">1. Detalles del Aviso</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Título del Aviso</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">Precio (Opcional, en ARS)</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-1">WhatsApp de Contacto</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <Phone size={18} />
                  </div>
                  <input 
                    type="text" required
                    value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                    placeholder="Ej: 5491112345678" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoría</label>
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Imagen Principal (URL)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <ImageIcon size={18} />
                </div>
                <input 
                  type="url" required
                  value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg pl-10 p-3 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
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
            <h2 className="text-xl font-semibold text-primary border-b border-border pb-2">2. Elige tu Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col transition-all ${formData.plan === 'free' ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-gray-500'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-white">Plan Gratuito</span>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="free" 
                    checked={formData.plan === 'free'}
                    onChange={() => setFormData({...formData, plan: 'free'})}
                    className="w-5 h-5 text-primary accent-primary" 
                  />
                </div>
                <p className="text-gray-400 text-sm flex-1">Publica tu aviso de forma gratuita. Aparecerá en la lista general con el resto de los avisos.</p>
                <div className="mt-4 font-bold text-xl text-white">
                  $0 ARS
                </div>
              </label>

              <label className={`cursor-pointer border-2 rounded-xl p-5 flex flex-col transition-all relative overflow-hidden ${formData.plan === 'highlight' ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'border-border bg-background hover:border-gray-500'}`}>
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMENDADO</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg text-white flex items-center">
                    <Star size={18} className="text-purple-400 mr-2 fill-purple-400" />
                    Destacado x7 Días
                  </span>
                  <input 
                    type="radio" 
                    name="plan" 
                    value="highlight" 
                    checked={formData.plan === 'highlight'}
                    onChange={() => setFormData({...formData, plan: 'highlight'})}
                    className="w-5 h-5 text-purple-500 accent-purple-500" 
                  />
                </div>
                <p className="text-gray-400 text-sm flex-1">Tu aviso aparecerá primero en las búsquedas y resaltado con colores premium. Vende mucho más rápido.</p>
                <div className="mt-4 font-bold text-xl text-white">
                  $1.000 ARS
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold p-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 mt-8 text-lg shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
          >
            {loading ? 'Procesando...' : (
              <>
                {formData.plan === 'highlight' ? 'Continuar al Pago' : 'Publicar Ahora'}
                <Send size={20} className="ml-2" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
