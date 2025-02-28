
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

const PAGE_SIZE = 10;

export default function ServicePayments() {
  const [page, setPage] = useState(1);
  const [showRecurringOnly, setShowRecurringOnly] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedBrandStatus, setSelectedBrandStatus] = useState("all");
  const [selectedCreatorStatus, setSelectedCreatorStatus] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading, refetch } = useServicePayments(
    page, 
    PAGE_SIZE, 
    showRecurringOnly,
    selectedService,
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
  };

  const handleGenerateMonthlyPayments = async () => {
    try {
      setIsGenerating(true);
      const { data: result, error } = await supabase
        .rpc('generate_monthly_pending_payments');

      if (error) throw error;

      const paymentsGenerated = result || 0;

      // Registrar la acción en el log de auditoría
      if (userId) {
        await supabase.rpc('insert_audit_log', {
          _admin_id: userId,
          _action_type: 'payment',
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

      // Actualizar la lista de pagos
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

  const content = (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <ServicePaymentsHeader 
            showRecurringOnly={showRecurringOnly}
            setShowRecurringOnly={setShowRecurringOnly}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            selectedBrandStatus={selectedBrandStatus}
            setSelectedBrandStatus={setSelectedBrandStatus}
            selectedCreatorStatus={selectedCreatorStatus}
            setSelectedCreatorStatus={setSelectedCreatorStatus}
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
          {data?.payments && (
            <>
              <ServicePaymentsTable 
                payments={data.payments} 
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
          )}
        </TabsContent>

        <TabsContent value="edit">
          {selectedPayment && (
            <ServicePaymentUpdateForm
              payment={selectedPayment}
              onClose={handleEditClose}
            />
          )}
        </TabsContent>
      </Tabs>
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
