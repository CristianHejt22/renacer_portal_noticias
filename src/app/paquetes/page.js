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
      </div>
    </div>
  );
}
