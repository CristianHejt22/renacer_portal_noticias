import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getAdSettings } from '@/app/actions/settings';

export async function generateMetadata() {
  const adSettings = await getAdSettings();
  const siteName = adSettings.data?.siteName || "THE DINNER Portal";
  const siteDescription = adSettings.data?.siteDescription || "Las últimas noticias al instante";
  
  return {
    metadataBase: new URL(adSettings.data?.siteUrl || 'https://librecielo.com'),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      type: 'website',
      siteName: siteName,
    },
  };
}

export const revalidate = 60; // ISR cache for 60 seconds (improves speed)

import Script from 'next/script';
import WhatsAppFloatingButton from '@/components/shared/WhatsAppFloatingButton';
import ScriptInjector from '@/components/shared/ScriptInjector';
import { getBanners } from '@/app/actions/banners';
import GoogleAnalytics from '@/components/shared/GoogleAnalytics';

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }) {
  // Fetch settings and banners in parallel for maximum performance
  const [adSettings, bannersRes] = await Promise.all([
    getAdSettings(),
    getBanners()
  ]);

  const headScript = adSettings.data?.headScript || '';
  const adsenseClientId = adSettings.data?.adsenseClientId || '';
  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';
  
  // Plan Cielo Total
  const activeBanners = bannersRes.data || [];
  const cieloTotal = activeBanners.find(b => b.position === 'plan-cielo-total' && b.isActive);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-16">
        <GoogleAnalytics gaId={gaId} />
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {headScript ? (
          <ScriptInjector htmlCode={headScript} />
        ) : null}

        {/* PLAN CIELO TOTAL */}
        {cieloTotal && (
          <div className="w-full bg-black">
            <a href={`/api/banner/click?id=${cieloTotal.id}&url=${encodeURIComponent(cieloTotal.targetUrl)}`} target="_blank" rel="noopener noreferrer" className="block w-full">
              <img src={cieloTotal.imageUrl} alt={cieloTotal.name} className="w-full object-cover max-h-[400px]" />
            </a>
          </div>
        )}

        <Navbar />
        <WhatsAppFloatingButton phoneNumber={adSettings.data?.whatsappNumber} />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-800 mt-10 space-y-2">
          <p>© {new Date().getFullYear()} THE DINNER Portal. Todos los derechos reservados.</p>
        </footer>
      </body>
    </html>
  );
}
