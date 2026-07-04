'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/app/actions/auth';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(formData.email, formData.password);

    if (res.success) {
      router.push('/mi-cuenta');
    } else {
      setError(res.error || 'Credenciales inválidas.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl glass">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Bienvenido</h1>
          <p className="text-gray-400">Inicia sesión para gestionar tus clasificados</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-background border border-border rounded-lg pl-10 p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="correo@ejemplo.com" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-background border border-border rounded-lg pl-10 p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold p-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Iniciando...' : (
              <>
                Iniciar Sesión
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-primary hover:underline">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
