import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-primary hover:text-accent mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Volver al inicio
        </Link>
        
        <div className="bg-surface glass border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Términos y Condiciones</h1>
          
          <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
            <p>
              Bienvenido a nuestro Portal de Noticias y Clasificados. Al registrarte y utilizar nuestros servicios, aceptas cumplir con los siguientes términos y condiciones. Te recomendamos leerlos detenidamente.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Uso del Servicio</h2>
            <p>
              Nuestro portal ofrece un espacio para la publicación de noticias y avisos clasificados. El usuario se compromete a hacer un uso adecuado y lícito de la plataforma, evitando publicar contenido ofensivo, fraudulento, ilegal o que infrinja derechos de terceros.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Publicación de Clasificados</h2>
            <p>
              Al publicar un aviso clasificado, el usuario es el único responsable de la veracidad y exactitud de la información proporcionada (incluyendo precios, descripciones e imágenes). El portal no interviene en las transacciones entre compradores y vendedores, actuando únicamente como un intermediario publicitario.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Paquetes de Créditos y Pagos</h2>
            <p>
              La publicación de clasificados está sujeta al uso de "Créditos" virtuales. Los créditos se adquieren mediante el pago de paquetes a través de transferencias bancarias o los medios de pago habilitados. Una vez acreditado el pago, los créditos no son reembolsables. El tiempo de acreditación puede variar de 30 minutos a 2 horas hábiles.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. Moderación y Suspensión de Cuentas</h2>
            <p>
              Nos reservamos el derecho de moderar, editar o eliminar cualquier publicación que viole estos términos. Asimismo, podemos suspender o cancelar cuentas de usuarios que realicen spam, fraudes o comportamientos indebidos sin previo aviso ni derecho a reembolso.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. Modificaciones</h2>
            <p>
              El portal se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página.
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
