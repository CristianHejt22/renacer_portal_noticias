'use client';

import { Toaster, toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { Globe, Tag, ShoppingCart } from 'lucide-react';
import { getRecentActivity } from '@/app/actions/activity';

export default function NotificationSystem() {
  const timerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let messages = [];

    const loadRealActivity = async () => {
      const res = await getRecentActivity();
      if (res.success && res.data.length > 0) {
        messages = res.data.map(item => {
          let icon = <Globe className="w-5 h-5 text-accent" />;
          if (item.type === 'classified') icon = <Tag className="w-5 h-5 text-primary" />;
          if (item.type === 'request') icon = <ShoppingCart className="w-5 h-5 text-blue-400" />;
          
          return {
            text: item.text,
            icon: icon
          };
        });
      } else {
        // Fallback in case there is no activity at all
        messages = [
          { text: "Bienvenido a Renacer Regional", icon: <Globe className="w-5 h-5 text-accent" /> }
        ];
      }

      if (isMounted) {
        scheduleNextNotification();
      }
    };

    const scheduleNextNotification = () => {
      if (messages.length === 0) return;
      
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      
      toast(
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/5 border border-white/10">
            {randomMsg.icon}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{randomMsg.text}</p>
            <p className="text-xs text-muted-foreground">Recientemente</p>
          </div>
        </div>,
        {
          duration: 3500,
          position: 'bottom-left',
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
      timerRef.current = setTimeout(scheduleNextNotification, nextTime);
    };

    // Primera notificación después de 5 segundos, precedida por la carga de datos
    setTimeout(loadRealActivity, 5000);

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <Toaster />
  );
}
