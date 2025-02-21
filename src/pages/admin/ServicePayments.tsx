
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

  const content = (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-4">
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
