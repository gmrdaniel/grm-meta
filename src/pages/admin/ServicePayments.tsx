
import { ServicePaymentsTable } from "@/components/service-payments/ServicePaymentsTable";

export default function ServicePayments() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona todos los pagos de servicios realizados en la plataforma
          </p>
        </div>
      </div>

      <ServicePaymentsTable />
    </div>
  );
}
