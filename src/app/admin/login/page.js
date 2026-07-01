'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, createFirstAdmin, checkHasUsers } from '@/app/actions/auth';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkUsers() {
      const res = await checkHasUsers();
      if (res.success && !res.hasUsers) {
        setIsSetupMode(true);
      }
      setChecking(false);
    }
    checkUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSetupMode) {
      const res = await createFirstAdmin(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Ocurrió un error');
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Credenciales inválidas');
      }
    }
    
    setLoading(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-400">Verificando seguridad...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-surface glass p-8 rounded-2xl border border-border shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
            {isSetupMode ? <ShieldCheck size={32} /> : <Lock size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSetupMode ? 'Configuración Inicial' : 'Iniciar Sesión'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {isSetupMode 
              ? 'Parece que no hay administradores. Crea tu cuenta principal.' 
              : 'Ingresa al panel de administración'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="admin@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white p-3 rounded-lg font-medium transition-colors disabled:opacity-70 mt-2"
          >
            <span>{isSetupMode ? (loading ? 'Creando...' : 'Crear Administrador') : (loading ? 'Entrando...' : 'Ingresar')}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}
