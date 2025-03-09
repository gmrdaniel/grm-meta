
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonalInfoCard } from "@/components/creator/PersonalInfoCard";
import { BankDetailsCard } from "@/components/creator/BankDetailsCard";
import { EmailSection } from "@/components/admin/creator-detail/EmailSection";
import { ServiceManager } from "@/components/admin/creator-detail/ServiceManager";
import { useCreatorDetail } from "@/hooks/useCreatorDetail";
import { useCreatorServices } from "@/hooks/useCreatorServices";

export default function CreatorDetail() {
  const { id } = useParams<{ id: string }>();
  const { creator, loading } = useCreatorDetail(id);
  const { 
    creatorServices, 
    availableServices, 
    selectedServiceId, 
    setSelectedServiceId, 
    addingService, 
    handleAddService 
  } = useCreatorServices(id);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!creator) {
    return <div>Creator not found</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link to="/admin/creators">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Creators
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              <EmailSection email={creator.email} />
              <PersonalInfoCard personalData={creator.personal_data} />
              <BankDetailsCard bankDetails={creator.bank_details} />
              <ServiceManager
                creatorId={creator.id}
                creatorServices={creatorServices}
                availableServices={availableServices}
                selectedServiceId={selectedServiceId}
                onServiceSelect={setSelectedServiceId}
                onAddService={() => id && handleAddService(id)}
                addingService={addingService}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
