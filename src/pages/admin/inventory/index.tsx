import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorsList } from "@/components/admin/inventory/CreatorsList";
import { CreatorForm } from "@/components/admin/inventory/CreatorForm";
import { Creator } from "@/types/creator";
import { CreatorDetail } from "@/components/admin/inventory/CreatorDetail";
import { ImportCreators } from "@/components/admin/inventory/ImportCreators";
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { toast } from "sonner";
import { CreatorFilter } from "@/components/admin/inventory/import-templates/types";

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [filters, setFilters] = useState<CreatorFilter>({});

  const { refetch } = useQuery({
    queryKey: ["creators"],
    queryFn: () => fetchCreators(1, 10, filters),
  });

  const handleCreatorSelect = (creator: Creator) => {
    setSelectedCreator(creator);
    setActiveTab("detail");
  };

  const handleBackToList = () => {
    setSelectedCreator(null);
    setActiveTab("list");
  };

  const handleFilterChange = (newFilters: CreatorFilter) => {
    setFilters(newFilters);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">Creator Inventory</h1>

            <Tabs
              defaultValue="list"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-6">
                <TabsTrigger value="list">Creator List</TabsTrigger>
                <TabsTrigger value="create">Create Creator</TabsTrigger>
                <TabsTrigger value="import">Import Creators</TabsTrigger>
                {selectedCreator && (
                  <TabsTrigger value="detail">Creator Detail</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="list" className="space-y-6">
                <CreatorsList
                  onCreatorSelect={handleCreatorSelect}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-xl font-semibold mb-6">
                    Add New Creator
                  </h2>
                  <CreatorForm
                    onSuccess={() => {
                      setActiveTab("list");
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-6">
                <ImportCreators
                  onSuccess={() => {
                    refetch();
                    toast.success("Creators imported successfully");
                  }}
                />
              </TabsContent>

              {selectedCreator && (
                <TabsContent value="detail" className="space-y-6">
                  <CreatorDetail
                    creator={selectedCreator}
                    onBack={handleBackToList}
                    onUpdate={() => {
                      refetch();
                    }}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
