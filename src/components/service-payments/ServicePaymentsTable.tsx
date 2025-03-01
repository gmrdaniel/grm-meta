
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { format } from "date-fns";

interface ServicePaymentsTableProps {
  payments: any[];
  onPaymentSelect: (payment: any) => void;
}

export function ServicePaymentsTable({ payments, onPaymentSelect }: ServicePaymentsTableProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pagado':
        return 'bg-green-500';
      case 'pendiente':
        return 'bg-yellow-500';
      case 'atrasado':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mes de Pago Creador</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Creador</TableHead>
            <TableHead>Ganancia Empresa</TableHead>
            <TableHead>Estado Pago Marca</TableHead>
            <TableHead>Fecha Pago Marca</TableHead>
            <TableHead>Ganancia Creador</TableHead>
            <TableHead>Estado Pago Creador</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment: any) => (
            <TableRow key={payment.id}>
              <TableCell>
                {payment.creator_payment_date
                  ? format(new Date(payment.creator_payment_date), "MMMM yyyy")
                  : payment.payment_period || "N/A"}
              </TableCell>
              <TableCell>
                {payment.creator_service?.service?.name || "N/A"}
              </TableCell>
              <TableCell>
                {payment.creator_service?.profile?.full_name || 
                  (payment.creator_service?.profile?.personal_data 
                    ? `${payment.creator_service.profile.personal_data.first_name || ''} ${payment.creator_service.profile.personal_data.last_name || ''}`.trim()
                    : "N/A")}
              </TableCell>
              <TableCell>${payment.company_earning || 0}</TableCell>
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
              <TableCell>${payment.creator_earning || 0}</TableCell>
              <TableCell>
                <Badge className={getStatusBadgeColor(payment.creator_payment_status)}>
                  {payment.creator_payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onPaymentSelect(payment)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
