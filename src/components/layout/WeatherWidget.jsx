'use client';

import { useState, useEffect } from 'react';

const climaEmojis = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️",
  55: "🌧️", 61: "🌧️", 63: "🌧️", 65: "⛈️",
  71: "❄️", 73: "❄️", 75: "❄️", 80: "🌦️",
  81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️"
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Reloj
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Coordenadas de Bahía Blanca
    const lat = "-38.7196";
    const lon = "-62.2663";
    const urlAPI = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&timezone=America%2FArgentina%2FBuenos_Aires`;

    fetch(urlAPI)
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar clima');
        return res.json();
      })
      .then(data => {
        const cur = data.current;
        setWeather({
          emoji: climaEmojis[cur.weather_code] || "⛅",
          temp: Math.round(cur.temperature_2m),
          st: Math.round(cur.apparent_temperature)
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(true);
        setLoading(false);
      });

    return () => clearInterval(timer);
  }, []);

  if (error) return null; // Si falla, se oculta discretamente

  return (
    <div className="inline-flex items-center gap-2 bg-slate-100/10 hover:bg-slate-100/20 px-3 py-1.5 rounded-full text-[0.85rem] text-gray-200 font-semibold border border-white/10 whitespace-nowrap transition-all duration-300 transform hover:-translate-y-[1px]">
      {loading ? (
        <span className="text-gray-400 text-xs">...</span>
      ) : (
        <>
          <span 
            className="text-[1.1rem] inline-block animate-[bounce_3s_ease-in-out_infinite]"
            title="Clima automatizado"
          >
            {weather.emoji}
          </span>
          <span className="text-sky-400">{weather.temp}°C</span>
          <span className="hidden sm:inline text-xs text-gray-400 font-normal">ST: {weather.st}°</span>
          <span className="hidden sm:inline text-gray-500 mx-0.5">|</span>
          <span className="hidden sm:inline text-xs text-gray-400">Bahía</span>
          <span className="text-gray-500 mx-0.5">|</span>
          <span className="text-primary font-bold text-sm tracking-wider">{currentTime}</span>
        </>
      )}
    </div>
  );
}
