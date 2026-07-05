import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-primary hover:text-accent mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Volver al inicio
        </Link>
        
        <div className="bg-surface glass border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Políticas de Privacidad</h1>
          
          <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
            <p>
              En nuestro Portal, nos tomamos muy en serio la privacidad de tus datos. Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu información personal.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Información que recopilamos</h2>
            <p>
              Cuando te registras en nuestro portal o publicas un anuncio clasificado, podemos solicitarte información personal como: nombre, dirección de correo electrónico, y número de teléfono (WhatsApp). También recopilamos datos técnicos básicos sobre tu dispositivo y navegación mediante el uso de cookies.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Uso de la Información</h2>
            <p>
              Utilizamos tu información para:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Crear y gestionar tu cuenta de usuario.</li>
              <li>Mostrar los datos de contacto en tus anuncios clasificados (para que los compradores te contacten).</li>
              <li>Procesar las compras de paquetes de créditos y contactarte si hay problemas con tu pago.</li>
              <li>Mejorar nuestros servicios y la seguridad de la plataforma.</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Compartir Información</h2>
            <p>
              No vendemos ni alquilamos tu información personal a terceros. Parte de tu información (como tu número de WhatsApp y nombre) será pública únicamente cuando tú decidas incluirla en un aviso clasificado para facilitar la venta de tus artículos.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas (como contraseñas encriptadas y conexiones seguras) para proteger tu información contra el acceso no autorizado, alteración o destrucción.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Tus Derechos</h2>
            <p>
              Tienes el derecho de acceder, corregir o solicitar la eliminación de tu información personal en cualquier momento. Si deseas dar de baja tu cuenta, puedes contactar a la administración del portal.
            </p>

            <div className="mt-12 p-6 bg-white/5 rounded-xl border border-border text-sm">
              <p>Última actualización: {new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
