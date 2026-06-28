'use client';

import { useState } from 'react';
import { Database } from 'lucide-react';

export default function MigrationButton() {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleMigrate = async () => {
    if (!supabaseUrl) return alert('Por favor, pega la URL de Supabase');
    
    if (!confirm('¿Estás seguro de clonar los datos de Supabase hacia Coolify? Esto sobrescribirá la base de datos actual.')) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/migrate-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          supabaseUrl, 
          secret: 'renacer-migracion-coolify' 
        })
      });

      const data = await res.json();
      
      if (data.success) {
        setResult(`Éxito: ${data.message} (Noticias: ${data.stats.posts}, Usuarios: ${data.stats.users})`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error crítico: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="glass p-6 rounded-xl border border-border mt-8">
      <div className="flex items-center gap-3 mb-4 text-accent">
        <Database size={24} />
        <h2 className="text-xl font-bold">Herramienta de Migración: Supabase a Coolify</h2>
      </div>
      <p className="text-sm text-gray-400 mb-4">
        Pega tu <strong>DATABASE_URL</strong> antigua (la de Supabase que termina en 6543) para clonar todas tus noticias hacia esta nueva base de datos local en Coolify.
      </p>
      
      <div className="flex gap-4">
        <input 
          type="text" 
          placeholder="postgres://postgres.xxx:pass@aws-1-sa-east-1.pooler.supabase.com:6543/postgres" 
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:border-accent outline-none"
          value={supabaseUrl}
          onChange={(e) => setSupabaseUrl(e.target.value)}
        />
        <button 
          onClick={handleMigrate}
          disabled={loading}
          className="bg-accent hover:bg-accent/80 text-background font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Clonando datos...' : 'Clonar desde Supabase'}
        </button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded-lg text-sm font-medium ${result.startsWith('Éxito') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {result}
        </div>
      )}
    </div>
  );
}
