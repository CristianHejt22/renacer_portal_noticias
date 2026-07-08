import { getPendingPurchaseRequests } from '@/app/actions/purchases';
import PurchaseRequestTable from '@/components/admin/PurchaseRequestTable';

export const metadata = {
  title: 'Solicitudes de Compra - Admin',
};

export default async function PurchasesAdminPage() {
  const res = await getPendingPurchaseRequests();
  const requests = res.success ? res.data : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Solicitudes de Compra (Transferencias)</h1>
      </div>

      <PurchaseRequestTable initialRequests={requests} />
      
      {requests.length === 0 && (
        <div className="p-12 text-center text-gray-500 glass rounded-xl border border-border">
          <p>No hay solicitudes pendientes en este momento.</p>
        </div>
      )}
    </div>
  );
}
