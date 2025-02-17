
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CreatorServicesTable } from "@/components/creator-services/CreatorServicesTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicePaymentForm } from "@/components/creator-services/ServicePaymentForm";

export default function CreatorServices() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setActiveTab("payment");
  };

  const handlePaymentComplete = () => {
    setSelectedServiceId(null);
    setActiveTab("list");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="list">Servicios</TabsTrigger>
                <TabsTrigger value="payment" disabled={!selectedServiceId}>
                  Registrar Pago
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                <CreatorServicesTable onServiceSelect={handleServiceSelect} />
              </TabsContent>

              <TabsContent value="payment">
                {selectedServiceId && (
                  <ServicePaymentForm
                    creatorServiceId={selectedServiceId}
                    onClose={handlePaymentComplete}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
