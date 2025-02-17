
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ServicePaymentUpdateForm } from "@/components/payments/ServicePaymentUpdateForm";
import { useState } from "react";

interface ServicePaymentsTableProps {
  payments: any[];
}

export function ServicePaymentsTable({ payments }: ServicePaymentsTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Creador</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Monto Total</TableHead>
            <TableHead>Ganancia Empresa</TableHead>
            <TableHead>Ganancia Creador</TableHead>
            <TableHead>Estado Pago Marca</TableHead>
            <TableHead>Fecha Pago Marca</TableHead>
            <TableHead>Estado Pago Creador</TableHead>
            <TableHead>Fecha Pago Creador</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment: any) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.creator_service?.profiles?.personal_data
                  ? `${payment.creator_service.profiles.personal_data.first_name} ${payment.creator_service.profiles.personal_data.last_name}`
                  : "N/A"}
              </TableCell>
              <TableCell>
                {payment.creator_service?.services?.name ?? "N/A"}
              </TableCell>
              <TableCell>${payment.total_amount}</TableCell>
              <TableCell>${payment.company_earning}</TableCell>
              <TableCell>${payment.creator_earning}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(payment.brand_payment_status)}>
                  {payment.brand_payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.brand_payment_date
                  ? format(new Date(payment.brand_payment_date), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(payment.creator_payment_status)}>
                  {payment.creator_payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.creator_payment_date
                  ? format(new Date(payment.creator_payment_date), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Registrar Pago</SheetTitle>
                    </SheetHeader>
                    {selectedPayment && (
                      <ServicePaymentUpdateForm
                        payment={selectedPayment}
                        onClose={() => setSelectedPayment(null)}
                      />
                    )}
                  </SheetContent>
                </Sheet>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
