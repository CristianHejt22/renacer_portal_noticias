'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function VideoVastHydrator() {
  const [ads, setAds] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Fetch available VAST ads
    fetch('/api/banner/active?position=vast-preroll')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setAds(data.data);
        }
        setIsLoaded(true);
      })
      .catch(err => {
        console.error('Failed to fetch VAST ads', err);
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || ads.length === 0) return;

    // Check if fluidPlayer is available
    const initPlayers = () => {
      if (typeof window.fluidPlayer === 'undefined') {
        setTimeout(initPlayers, 500);
        return;
      }

      // Find all native <video> tags
      const videos = document.querySelectorAll('video:not([data-fluid-id])');
      
      if (videos.length === 0) {
        return;
      }

      videos.forEach((video, index) => {
        // Asignar ID único si no lo tiene
        const uniqueId = `fluid-player-${Date.now()}-${index}`;
        video.id = video.id || uniqueId;
        video.setAttribute('data-fluid-id', 'true');
        
        // Estilos para encajar correctamente (CSS theme en línea)
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.maxWidth = '100%';
        video.style.borderRadius = '12px';
        video.style.overflow = 'hidden';

        // Select a random ad for this video player to ensure rotation
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        
        // Determinar URL del VAST: Si el imageUrl es .xml lo usamos directo, si no usamos nuestro endpoint
        let vastTagUrl = randomAd.imageUrl;
        if (!vastTagUrl.endsWith('.xml')) {
           vastTagUrl = `${window.location.origin}/api/vast?id=${randomAd.id}`;
        }

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
              logo: {
                  imageUrl: '/icon-512x512.png',
                  position: 'top right',
                  clickUrl: 'https://librecielo.com',
                  opacity: 0.8
              }
            },
            vastOptions: {
              adList: [
                {
                  roll: 'preRoll',
                  vastTag: vastTagUrl
                }
              ],
              adCTAText: 'Visitar Patrocinador',
              adCTATextPosition: 'bottom right'
            }
          });
        } catch (e) {
          console.error('Error initializing fluidPlayer on', video, e);
        }
      });
    };

    initPlayers();

  }, [isLoaded, ads]);

  if (ads.length === 0) return null;

  return (
    <>
      <link rel="stylesheet" href="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.css" type="text/css" />
      <Script src="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js" strategy="afterInteractive" />
      <style dangerouslySetInnerHTML={{__html: `
        .fluid_video_wrapper {
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
          margin-bottom: 1.5rem !important;
        }
        .fluid_video_wrapper:hover {
          box-shadow: 0 4px 25px rgba(234, 179, 8, 0.2) !important;
        }
      `}} />
    </>
  );
}
