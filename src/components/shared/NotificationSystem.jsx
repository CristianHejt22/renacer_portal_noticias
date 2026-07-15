'use client';

import { Toaster, toast } from 'sonner';
import { useEffect } from 'react';
import { Globe, Tag, Eye } from 'lucide-react';

export default function NotificationSystem() {
  useEffect(() => {
    // Simulador de notificaciones (Social Proof) para clasificados y web
    const messages = [
      { text: "Alguien acaba de publicar un nuevo clasificado", icon: <Tag className="w-5 h-5 text-primary" /> },
      { text: "Nuevo visitante en la web", icon: <Globe className="w-5 h-5 text-accent" /> },
      { text: "Un usuario está interesado en un clasificado", icon: <Eye className="w-5 h-5 text-blue-400" /> },
      { text: "Se ha compartido un artículo", icon: <Globe className="w-5 h-5 text-green-400" /> },
      { text: "Un clasificado ha sido vendido", icon: <Tag className="w-5 h-5 text-yellow-400" /> }
    ];

    const showNotification = () => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      toast(
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/5 border border-white/10">
            {randomMsg.icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{randomMsg.text}</p>
            <p className="text-xs text-muted-foreground">Hace un momento</p>
          </div>
        </div>,
        {
          duration: 3000,
          position: 'bottom-left', // A little less intrusive
          style: {
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: 'white',
            padding: '12px'
          }
        }
      );
      
      // Mostrar notificaciones aleatorias cada 20 a 45 segundos
      const nextTime = Math.random() * 25000 + 20000;
      setTimeout(showNotification, nextTime);
    };

    // Primera notificación después de 5 segundos
    const initialTimer = setTimeout(showNotification, 5000); 

    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <Toaster />
  );
}
