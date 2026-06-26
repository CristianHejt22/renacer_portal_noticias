'use client';

export default function WhatsAppFloatingButton({ phoneNumber }) {
  if (!phoneNumber) return null;

  // Asegurar que el número no tenga espacios ni caracteres raros
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Hola! Quiero enviar una noticia:');

  return (
    <a
      href={`https://wa.me/${cleanNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:bg-[#20bd5a] transition-all duration-300 flex items-center justify-center group"
      title="Envíanos tu noticia por WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
      
      {/* Tooltip visible en hover para desktop */}
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none hidden md:block shadow-xl">
        ¡Envíanos tu noticia!
        {/* Triangulito del tooltip */}
        <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></span>
      </span>
    </a>
  );
}
