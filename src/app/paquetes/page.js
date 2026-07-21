'use client';

import { Package, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PackagesPage() {
  const packages = [
    {
      id: 'pack-basico',
      name: 'Pack Básico',
      credits: 3,
      featured: 0,
      price: 4000,
      description: 'Ideal para empezar. Publica 3 anuncios normales.'
    },
    {
      id: 'pack-plus',
      name: 'Pack Plus',
      credits: 10,
      featured: 0,
      price: 8000,
      description: 'Publica más, paga menos. 10 anuncios normales.'
    },
    {
      id: 'pack-pro',
      name: 'Pack Pro',
      credits: 10,
      featured: 1,
      price: 10000,
      description: 'Destaca un aviso y vende más rápido. 10 normales + 1 destacado.',
      popular: true
    },
    {
      id: 'pack-premium',
      name: 'Pack Premium',
      credits: 10,
      featured: 5,
      price: 15000,
      description: 'El poder absoluto. 10 normales + 5 destacados.'
    },
    {
      id: 'pack-pymes-50',
      name: 'Pymes 50',
      credits: 50,
      featured: 10,
      price: 45000,
      description: 'Ideal para negocios. 50 normales + 10 destacados.',
      popular: true
    },
    {
      id: 'pack-pymes-100',
      name: 'Pymes 100',
      credits: 100,
      featured: 10,
      price: 80000,
      description: 'Gran volumen. 100 normales + 10 destacados.'
    }
  ];

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Compra Paquetes de Créditos</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Adquiere créditos para publicar tus clasificados. Un crédito equivale a un anuncio normal. 
            Adquiere destacados para vender hasta 10 veces más rápido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative bg-surface glass border rounded-3xl p-8 flex flex-col transition-transform hover:-translate-y-2 ${pkg.popular ? 'border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]' : 'border-border'}`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Más Popular
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-foreground mb-2">{pkg.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 h-12">{pkg.description}</p>
              
              <div className="text-4xl font-black text-foreground mb-6">
                ${pkg.price.toLocaleString('es-AR')}
              </div>
              
              <ul className="space-y-4 mb-8 flex-1 text-foreground">
                <li className="flex items-center">
                  <Package className="text-primary mr-3" size={20} />
                  <span><strong>{pkg.credits}</strong> Créditos Normales</span>
                </li>
                <li className="flex items-center">
                  <Star className={`${pkg.featured > 0 ? 'text-purple-400 fill-purple-400' : 'text-gray-500'} mr-3`} size={20} />
                  <span className={pkg.featured > 0 ? 'font-bold text-purple-300' : 'text-gray-400'}>
                    <strong>{pkg.featured}</strong> Créditos Destacados
                  </span>
                </li>
              </ul>
              
              <Link 
                href={`/transferencia?pack=${pkg.id}&price=${pkg.price}&name=${encodeURIComponent(pkg.name)}`}
                className={`w-full py-4 rounded-xl flex justify-center items-center font-bold transition-all ${pkg.popular ? 'bg-primary hover:bg-accent text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-foreground border border-border'}`}
              >
                Comprar Ahora
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </div>
          ))}
        </div>

        {/* Individual Featured Credits Section */}
        <div className="mt-24 pt-16 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Créditos Destacados Individuales</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              ¿Solo necesitas resaltar tus anuncios actuales? Compra Créditos Destacados por unidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'destacado-1', qty: 1, price: 1500 },
              { id: 'destacado-2', qty: 2, price: 2500 },
              { id: 'destacado-5', qty: 5, price: 5500, popular: true },
              { id: 'destacado-10', qty: 10, price: 10000 }
            ].map((pkg) => (
              <div 
                key={pkg.id} 
                className={`relative bg-surface glass border rounded-3xl p-6 flex flex-col text-center transition-transform hover:-translate-y-2 ${pkg.popular ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'border-border'}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Mejor Precio
                  </div>
                )}
                
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                  <Star className="text-purple-500 fill-purple-500" size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {pkg.qty} {pkg.qty === 1 ? 'Destacado' : 'Destacados'}
                </h3>
                
                <div className="text-3xl font-black text-foreground my-4">
                  ${pkg.price.toLocaleString('es-AR')}
                </div>
                
                <Link 
                  href={`/transferencia?pack=${pkg.id}&price=${pkg.price}&name=${encodeURIComponent(pkg.qty + ' Crédito(s) Destacado(s)')}`}
                  className={`w-full py-3 mt-auto rounded-xl flex justify-center items-center font-bold transition-all ${pkg.popular ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-background hover:bg-white/5 border border-border text-foreground'}`}
                >
                  Comprar
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
