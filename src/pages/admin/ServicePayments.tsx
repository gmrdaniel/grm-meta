
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
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      const { data: response, error: functionError } = await supabase.functions.invoke('generate-monthly-payments');
      
      if (functionError) {
        console.error('Function error:', functionError);
        throw new Error(functionError.message || 'Error al generar los pagos mensuales');
      }

      if (response?.success) {
        toast.success('Pagos mensuales generados exitosamente');
        refetch();
      } else {
        throw new Error(response?.message || 'Error desconocido al generar los pagos');
      }
    } catch (error: any) {
      console.error('Error details:', error);
      const errorMessage = error.message || 'Error al generar los pagos mensuales';
      setError(errorMessage);
      toast.error(errorMessage);
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
            className="ml-4"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generando...' : 'Generar Pagos Mensuales'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
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
