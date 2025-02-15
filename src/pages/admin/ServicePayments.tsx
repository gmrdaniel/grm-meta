
import { ServicePaymentsTable } from "@/components/service-payments/ServicePaymentsTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ServicePaymentForm } from "@/components/service-payments/ServicePaymentForm";
import { useState } from "react";

export default function ServicePayments() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h1>
          <p className="text-muted-foreground">
            Gestiona todos los pagos de servicios realizados en la plataforma
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <ServicePaymentForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ServicePaymentsTable />
    </div>
  );
}
