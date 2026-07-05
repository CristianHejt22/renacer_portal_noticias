'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/app/actions/auth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Debes aceptar los Términos y Condiciones y Políticas de Privacidad.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await registerUser(formData.name, formData.email, formData.password);

    if (res.success) {
      router.push('/mi-cuenta');
    } else {
      setError(res.error || 'Ocurrió un error al registrarse.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md bg-surface border border-border p-8 rounded-2xl shadow-xl glass">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Crear Cuenta</h1>
          <p className="text-gray-400">Regístrate para publicar clasificados</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-background border border-border rounded-lg pl-10 p-2.5 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                placeholder="Tu nombre" 
              />
            </div>
          </div>
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

          <div className="flex items-start mt-2">
            <div className="flex items-center h-5">
              <input 
                id="terms" 
                type="checkbox" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-4 h-4 rounded bg-background border-border text-primary focus:ring-primary focus:ring-2" 
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="text-primary hover:underline">Términos y Condiciones</Link>
              {' '}y las{' '}
              <Link href="/privacidad" target="_blank" className="text-primary hover:underline">Políticas de Privacidad</Link>.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-accent text-white font-semibold p-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Registrando...' : (
              <>
                Registrarse
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
