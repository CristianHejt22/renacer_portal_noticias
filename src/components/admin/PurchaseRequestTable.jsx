'use client';

import { useState } from 'react';
import { approvePurchaseRequest, rejectPurchaseRequest } from '@/app/actions/purchases';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PurchaseRequestTable({ initialRequests }) {
  const [requests, setRequests] = useState(initialRequests);
  const [processing, setProcessing] = useState(null);
  const router = useRouter();

  const handleApprove = async (id) => {
    setProcessing(id);
    const res = await approvePurchaseRequest(id);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } else {
      alert(res.error || 'Error al aprobar');
    }
    setProcessing(null);
  };

  const handleReject = async (id) => {
    if (!confirm('¿Seguro que deseas rechazar esta solicitud?')) return;
    setProcessing(id);
    const res = await rejectPurchaseRequest(id);
    if (res.success) {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      router.refresh();
    } else {
      alert(res.error || 'Error al rechazar');
    }
    setProcessing(null);
  };

  if (requests.length === 0) {
    return null; // Don't show the section if there are no pending requests
  }

  return (
    <div className="glass p-6 rounded-xl border border-border mb-10">
      <h2 className="text-xl font-bold mb-4 text-yellow-500">Solicitudes de Compra Pendientes</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-gray-400 font-medium">Usuario</th>
              <th className="pb-3 text-gray-400 font-medium">Paquete</th>
              <th className="pb-3 text-gray-400 font-medium">Monto</th>
              <th className="pb-3 text-gray-400 font-medium">Fecha</th>
              <th className="pb-3 text-gray-400 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                <td className="py-4">
                  <div className="font-medium text-foreground">{req.user?.name || 'Usuario'}</div>
                  <div className="text-xs text-gray-500">{req.user?.email}</div>
                </td>
                <td className="py-4 text-sm">{req.packageName}</td>
                <td className="py-4 text-sm font-bold text-primary">${req.amount.toLocaleString('es-AR')}</td>
                <td className="py-4 text-sm text-gray-400">
                  {new Date(req.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={processing === req.id}
                      className="p-2 bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                      title="Aprobar"
                    >
                      {processing === req.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={processing === req.id}
                      className="p-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
                      title="Rechazar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
