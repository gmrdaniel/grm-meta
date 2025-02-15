
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ServicePayment {
  id: string;
  total_amount: number;
  company_earning: number;
  creator_earning: number;
  brand_payment_status: string;
  creator_payment_status: string;
  brand_payment_date: string | null;
  creator_payment_date: string | null;
  payment_receipt_url: string | null;
  creator_service: {
    profiles: {
      personal_data: {
        first_name: string;
        last_name: string;
      } | null;
    };
    services: {
      name: string;
    } | null;
  } | null;
}

export function ServicePaymentsTable() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['service-payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_payments')
        .select(`
          *,
          creator_service:creator_services (
            profiles (
              personal_data (
                first_name,
                last_name
              )
            ),
            services (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ServicePayment[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
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
            <TableHead>Comprobante</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => (
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
                <Badge className={getStatusColor(payment.brand_payment_status)}>
                  {payment.brand_payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.brand_payment_date
                  ? format(new Date(payment.brand_payment_date), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(payment.creator_payment_status)}>
                  {payment.creator_payment_status}
                </Badge>
              </TableCell>
              <TableCell>
                {payment.creator_payment_date
                  ? format(new Date(payment.creator_payment_date), "dd/MM/yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell>
                {payment.payment_receipt_url ? (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(payment.payment_receipt_url!, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                ) : (
                  "N/A"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
