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
  const siteName = adSettings.data?.siteName || "Renacer Noticias";
  const siteDescription = adSettings.data?.siteDescription || "Las últimas noticias al instante";
  
  return {
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

import Script from 'next/script';
import WhatsAppFloatingButton from '@/components/shared/WhatsAppFloatingButton';

export default async function RootLayout({ children }) {
  const adSettings = await getAdSettings();
  const headScript = adSettings.data?.headScript || '';
  const adsenseClientId = adSettings.data?.adsenseClientId || '';

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-16">
        {adsenseClientId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {headScript ? (
          <div dangerouslySetInnerHTML={{ __html: headScript }} className="hidden" />
        ) : null}
        <Navbar />
        <WhatsAppFloatingButton phoneNumber={adSettings.data?.whatsappNumber} />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-800 mt-10">
          © {new Date().getFullYear()} Renacer Noticias. Todos los derechos reservados.
        </footer>
      </body>
    </html>
  );
}
