
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { CreatorServicesPagination } from "@/components/creator-services/CreatorServicesPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

const PAGE_SIZE = 10;

export default function ServicePayments() {
  const [page, setPage] = useState(1);
  const [showRecurringOnly, setShowRecurringOnly] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['service-payments', page, showRecurringOnly],
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
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
        `, { count: 'exact' })
        .order('payment_date', { ascending: false })
        .range(from, to);

      if (showRecurringOnly) {
        query = query.eq('is_recurring', true);
      }

      const { data: payments, error, count } = await query;

      if (error) throw error;
      return {
        payments,
        totalCount: count || 0
      };
    },
  });

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

  const content = (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/dashboard">
              <Home className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Pagos de Servicios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos de Servicios</h1>
        <p className="text-muted-foreground">
          Gestiona los pagos de servicios de los creadores
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={showRecurringOnly}
          onCheckedChange={setShowRecurringOnly}
        />
        <Label htmlFor="recurring">Show recurring only</Label>
      </div>

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.payments.map((payment: any) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreatorServicesPagination
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto py-6 space-y-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-[400px] w-full" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {content}
        </main>
      </div>
    </div>
  );
}
