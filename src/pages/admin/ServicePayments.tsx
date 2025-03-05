import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatorServicesPagination } from "@/components/creator-services/CreatorServicesPagination";
import { ServicePaymentsHeader } from "@/components/service-payments/ServicePaymentsHeader";
import { ServicePaymentsTable } from "@/components/service-payments/ServicePaymentsTable";
import { useServicePayments } from "@/hooks/useServicePayments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicePaymentUpdateForm } from "@/components/payments/ServicePaymentUpdateForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AuditActionType } from '@/components/audit/types';

const PAGE_SIZE = 10;

export default function ServicePayments() {
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedBrandStatus, setSelectedBrandStatus] = useState("all");
  const [selectedCreatorStatus, setSelectedCreatorStatus] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, refetch } = useServicePayments(
    page, 
    PAGE_SIZE, 
    selectedBrandStatus,
    selectedCreatorStatus
  );

  const handlePaymentSelect = (payment: any) => {
    setSelectedPayment(payment);
    setActiveTab("edit");
  };

  const handleEditClose = () => {
    setSelectedPayment(null);
    setActiveTab("list");
    refetch();
  };

  const handleBrandStatusChange = (newStatus: string) => {
    setPage(1);
    setSelectedBrandStatus(newStatus);
  };

  const handleCreatorStatusChange = (newStatus: string) => {
    setPage(1);
    setSelectedCreatorStatus(newStatus);
  };

  const handleGenerateMonthlyPayments = async () => {
    try {
      setIsGenerating(true);
      const { data: result, error } = await supabase
        .rpc('generate_monthly_pending_payments');

      if (error) throw error;

      const paymentsGenerated = result || 0;

      if (userId) {
        await supabase.rpc('insert_audit_log', {
          _admin_id: userId,
          _action_type: 'payment' as AuditActionType,
          _module: 'payments',
          _table_name: 'service_payments',
          _record_id: null,
          _new_data: { payments_generated: paymentsGenerated },
          _revertible: false,
          _ip_address: null,
          _user_agent: navigator.userAgent
        });
      }

      toast({
        title: "Pagos generados con éxito",
        description: `Se han generado ${paymentsGenerated} ${paymentsGenerated === 1 ? 'pago pendiente' : 'pagos pendientes'} para el mes actual.`,
      });

      refetch();
    } catch (error) {
      console.error('Error al generar pagos:', error);
      toast({
        variant: "destructive",
        title: "Error al generar pagos",
        description: "No se pudieron generar los pagos pendientes. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdatePayment = async (
    paymentId: string,
    previousData: any,
    updatedPayment: any
  ) => {
    try {
      await supabase.rpc('insert_audit_log', {
        _admin_id: user?.id,
        _action_type: 'payment' as AuditActionType,
        _module: 'payments',
        _table_name: 'service_payments',
        _record_id: paymentId,
        _previous_data: previousData,
        _new_data: updatedPayment,
        _revertible: true,
        _ip_address: null,
        _user_agent: null,
      });
    } catch (error) {
      console.error('Error al actualizar pago:', error);
      toast({
        variant: "destructive",
        title: "Error al actualizar pago",
        description: "No se pudo actualizar el pago. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const content = (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <ServicePaymentsHeader 
            selectedBrandStatus={selectedBrandStatus}
            setSelectedBrandStatus={handleBrandStatusChange}
            selectedCreatorStatus={selectedCreatorStatus}
            setSelectedCreatorStatus={handleCreatorStatusChange}
          />
          <Button
            onClick={handleGenerateMonthlyPayments}
            disabled={isGenerating}
            className="min-w-[250px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando pagos...
              </>
            ) : (
              "Generar pagos pendientes del mes"
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Lista de Pagos</TabsTrigger>
          <TabsTrigger value="edit" disabled={!selectedPayment}>
            Editar Pago
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : data ? (
            <>
              <ServicePaymentsTable 
                payments={data.payments || []} 
                onPaymentSelect={handlePaymentSelect}
              />
              <div className="mt-4">
                <CreatorServicesPagination
                  page={page}
                  totalPages={Math.ceil((data.totalCount || 0) / PAGE_SIZE)}
                  setPage={setPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              Error al cargar los datos. Por favor, inténtalo de nuevo.
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit">
          {selectedPayment && (
            <ServicePaymentUpdateForm
              payment={selectedPayment}
              onClose={handleEditClose}
              onUpdate={handleUpdatePayment}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  if (isLoading && !data) {
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
