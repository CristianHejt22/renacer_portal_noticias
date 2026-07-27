'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function VideoVastHydrator({ vastActive, vastUrl, vastCustomVideo }) {
  useEffect(() => {
    if (!vastActive || typeof window === 'undefined') return;

    // Check if fluidPlayer is available
    const initPlayers = () => {
      if (typeof window.fluidPlayer === 'undefined') {
        setTimeout(initPlayers, 500);
        return;
      }

      // Determine final VAST URL
      // If user uploaded a custom video, use our internal generator, else use the external vastUrl
      let finalVastUrl = vastUrl;
      if (vastCustomVideo) {
        finalVastUrl = '/api/vast'; // Uses relative path, FluidPlayer resolves it
      }

      if (!finalVastUrl) return; // Nothing to do

      // Find all native <video> tags
      const videos = document.querySelectorAll('article video:not([data-fluid-id])');
      
      videos.forEach((video, index) => {
        // Asignar ID único si no lo tiene
        const uniqueId = `fluid-player-${Date.now()}-${index}`;
        video.id = video.id || uniqueId;
        video.setAttribute('data-fluid-id', 'true');
        
        // Estilos para encajar correctamente
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.maxWidth = '100%';
        
        // Inicializar Fluid Player en este video
        try {
          window.fluidPlayer(video.id, {
            layoutControls: {
              primaryColor: '#eab308', // Yellow/Primary color
              posterImage: video.getAttribute('poster') || '',
              autoPlay: false,
              playButtonShowing: true,
              playPauseAnimation: true,
              fillToContainer: true,
            },
            vastOptions: {
              adList: [
                {
                  roll: 'preRoll',
                  vastTag: finalVastUrl
                }
              ],
              adCTAText: 'Visitar Anunciante',
              adCTATextPosition: 'bottom right'
            }
          });
        } catch (e) {
          console.error('Error initializing fluidPlayer on', video, e);
        }
      });
    };

    initPlayers();

  }, [vastActive, vastUrl, vastCustomVideo]);

  if (!vastActive) return null;

  return (
    <>
      <link rel="stylesheet" href="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.css" type="text/css" />
      <Script src="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js" strategy="lazyOnload" />
    </>
  );
}
