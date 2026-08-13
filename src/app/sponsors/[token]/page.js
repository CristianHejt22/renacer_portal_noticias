import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Eye, MousePointerClick, Percent, Calendar, Activity, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function SponsorMetricsPage({ params }) {
  const { token } = params;

  if (!token) return notFound();

  const banner = await prisma.bannerAd.findUnique({
    where: { token }
  });

  if (!banner) return notFound();

  const views = banner.views || 0;
  const targetViews = banner.targetViews;
  const clicks = banner.clicks || 0;
  const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';
  
  const hasLimit = !!targetViews;
  const progressPercent = hasLimit ? Math.min(100, Math.round((views / targetViews) * 100)) : 0;
  
  const isFinished = hasLimit && views >= targetViews;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white/90">Reporte de Rendimiento</h1>
            <p className="text-gray-400 mt-1">Campaña: <span className="font-semibold text-white">{banner.name}</span></p>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">LibreCielo</span>
          </Link>
        </header>

        {/* Status Alert */}
        {isFinished ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <h3 className="font-bold">¡Campaña Finalizada Exitosamente!</h3>
              <p className="text-sm opacity-80">Se ha alcanzado la meta de visualizaciones contratadas.</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl flex items-center space-x-3">
            <Activity className="w-6 h-6 shrink-0 animate-pulse" />
            <div>
              <h3 className="font-bold">Campaña Activa</h3>
              <p className="text-sm opacity-80">Las métricas se están recopilando en tiempo real.</p>
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <Eye className="w-8 h-8 text-blue-400 mb-4 opacity-50" />
            <p className="text-gray-400 text-sm font-medium">Visualizaciones Totales</p>
            <h2 className="text-4xl font-black mt-1">
              {new Intl.NumberFormat('es-AR').format(views)}
            </h2>
            {hasLimit && (
              <p className="text-xs text-gray-500 mt-2">de {new Intl.NumberFormat('es-AR').format(targetViews)} meta</p>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <MousePointerClick className="w-8 h-8 text-green-400 mb-4 opacity-50" />
            <p className="text-gray-400 text-sm font-medium">Clics (Redirecciones)</p>
            <h2 className="text-4xl font-black mt-1">
              {new Intl.NumberFormat('es-AR').format(clicks)}
            </h2>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <Percent className="w-8 h-8 text-yellow-400 mb-4 opacity-50" />
            <p className="text-gray-400 text-sm font-medium">CTR (Click-Through Rate)</p>
            <h2 className="text-4xl font-black mt-1">
              {ctr}%
            </h2>
            <p className="text-xs text-gray-500 mt-2">Porcentaje de usuarios que hicieron clic</p>
          </div>
        </div>

        {/* Progress Bar (if limit exists) */}
        {hasLimit && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-3">
              <div>
                <h3 className="font-bold text-lg">Progreso de la Campaña</h3>
                <p className="text-sm text-gray-400">Avance hacia el límite de visualizaciones</p>
              </div>
              <span className="text-2xl font-black text-blue-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Creative Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Arte Publicitario (Creativo)</h3>
          <div className="flex justify-center bg-black/50 p-8 rounded-xl border border-white/5">
            {banner.imageUrl.match(/\.(mp4|webm|ogg)$/i) ? (
              <video src={banner.imageUrl} controls className="max-h-64 rounded-lg object-contain" />
            ) : (
              <img src={banner.imageUrl} alt={banner.name} className="max-h-64 rounded-lg object-contain" />
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
            <span>Ubicación: <span className="text-white capitalize">{banner.position.replace('plan-', '').replace('-', ' ')}</span></span>
            <a href={banner.targetUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center">
              Probar Link de Destino <MousePointerClick className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
