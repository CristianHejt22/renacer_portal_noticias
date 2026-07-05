'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAdSettings } from '@/app/actions/settings';
import { CheckCircle, AlertTriangle, Building, Copy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function TransferenciaContent() {
  const searchParams = useSearchParams();
  const packId = searchParams.get('pack');
  const packName = searchParams.get('name') || 'Paquete de Créditos';
  const packPrice = searchParams.get('price');
  
  const [bankSettings, setBankSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    async function load() {
      const res = await getAdSettings();
      if (res.success && res.data) {
        setBankSettings({
          alias: res.data.bankAlias || 'No configurado',
          cvu: res.data.bankCvu || 'No configurado',
          name: res.data.bankName || 'No configurado',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Cargando datos de transferencia...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Link href="/paquetes" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={16} className="mr-2" /> Volver a paquetes
      </Link>

      <div className="bg-surface glass border border-border rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Building className="text-primary" size={32} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Pago por Transferencia</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
          Estás comprando el <strong>{packName}</strong> por un valor de <strong>${Number(packPrice).toLocaleString('es-AR')}</strong>.
        </p>

        <div className="bg-background border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Datos de la Cuenta</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-black/5 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Titular</p>
                <p className="font-mono text-foreground font-bold">{bankSettings?.name}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/5 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">CBU / CVU</p>
                <p className="font-mono text-foreground font-bold">{bankSettings?.cvu}</p>
              </div>
              <button onClick={() => handleCopy(bankSettings?.cvu, 'cvu')} className="text-primary hover:text-accent transition-colors flex items-center text-sm">
                {copied === 'cvu' ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/5 dark:bg-white/5 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Alias</p>
                <p className="font-mono text-foreground font-bold">{bankSettings?.alias}</p>
              </div>
              <button onClick={() => handleCopy(bankSettings?.alias, 'alias')} className="text-primary hover:text-accent transition-colors flex items-center text-sm">
                {copied === 'alias' ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 p-5 rounded-xl flex items-start mb-8">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mr-4 mt-0.5" size={24} />
          <div>
            <h3 className="font-bold text-yellow-700 dark:text-yellow-500 mb-1">Importante: Tiempo de Acreditación</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Una vez realizada la transferencia, <strong>tu paquete puede demorar de 30 minutos a 2 horas hábiles en ser activado</strong>. 
              Por favor guarda tu comprobante de pago.
            </p>
          </div>
        </div>

        <Link 
          href="/mi-cuenta" 
          className="w-full block text-center bg-primary hover:bg-accent text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
        >
          Ya realicé la transferencia
        </Link>
      </div>
    </div>
  );
}

export default function TransferenciaPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Cargando...</div>}>
        <TransferenciaContent />
      </Suspense>
    </div>
  );
}
