
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
    switch (status?.toLowerCase()) {
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

  // Función auxiliar para obtener el nombre del servicio de manera segura
  const getServiceName = (payment: any) => {
    try {
      // Primero intentamos con la ruta larga anidada
      if (payment.creator_service?.service?.name) {
        return payment.creator_service.service.name;
      }
      
      // Si no está disponible, buscamos en otra posible ubicación
      if (payment.creator_service?.service_id) {
        return `ID: ${payment.creator_service.service_id}`;
      }
      
      return "N/A";
    } catch (e) {
      console.error("Error getting service name:", e, payment);
      return "Error";
    }
  };

  // Función auxiliar para obtener el nombre del creador de manera segura
  const getCreatorName = (payment: any) => {
    try {
      if (payment.creator_service?.profile?.full_name) {
        return payment.creator_service.profile.full_name;
      }
      
      if (payment.creator_service?.profile?.personal_data) {
        const firstName = payment.creator_service.profile.personal_data.first_name || '';
        const lastName = payment.creator_service.profile.personal_data.last_name || '';
        if (firstName || lastName) {
          return `${firstName} ${lastName}`.trim();
        }
      }
      
      // Si hay profile_id pero no nombre, mostramos el ID
      if (payment.creator_service?.profile?.id) {
        return `ID: ${payment.creator_service.profile.id}`;
      }
      
      return "N/A";
    } catch (e) {
      console.error("Error getting creator name:", e, payment);
      return "Error";
    }
  };

  // Función auxiliar para formatear fechas de manera segura
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      console.error("Error formatting date:", e, dateString);
      return "Fecha inválida";
    }
  };

  // Función auxiliar para formatear el período de pago
  const formatPaymentPeriod = (payment: any) => {
    if (payment.payment_period) {
      return payment.payment_period;
    }
    
    if (payment.creator_payment_date) {
      try {
        return format(new Date(payment.creator_payment_date), "MMMM yyyy");
      } catch (e) {
        console.error("Error formatting payment period:", e);
      }
    }
    
    if (payment.payment_month) {
      try {
        return format(new Date(payment.payment_month), "MMMM yyyy");
      } catch (e) {
        console.error("Error formatting payment month:", e);
      }
    }
    
    return "N/A";
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
          {payments && payments.length > 0 ? (
            payments.map((payment: any) => (
              <TableRow key={payment.id}>
                <TableCell>{formatPaymentPeriod(payment)}</TableCell>
                <TableCell>{getServiceName(payment)}</TableCell>
                <TableCell>{getCreatorName(payment)}</TableCell>
                <TableCell>${payment.company_earning || 0}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(payment.brand_payment_status)}>
                    {payment.brand_payment_status || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(payment.brand_payment_date)}</TableCell>
                <TableCell>${payment.creator_earning || 0}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(payment.creator_payment_status)}>
                    {payment.creator_payment_status || "N/A"}
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-4">
                No se encontraron pagos con los filtros seleccionados
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
