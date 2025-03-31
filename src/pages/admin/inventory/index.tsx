import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorForm } from "@/components/admin/inventory/CreatorForm";
import { Creator } from "@/types/creator";
import { CreatorDetail } from "@/components/admin/inventory/CreatorDetail";
import { ImportCreators } from "@/components/admin/inventory/ImportCreators";
import { CreatorsSummary } from "@/components/admin/inventory/CreatorsSummary";
import { useQuery } from "@tanstack/react-query";
import { fetchCreators } from "@/services/creatorService";
import { toast } from "sonner";
import { CreatorFilter, CreatorsList } from "@/components/admin/inventory/creators-list";

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
            <h1 className="text-2xl font-bold mb-6">Inventario de Creadores</h1>
            
            <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">Lista de Creadores</TabsTrigger>
                <TabsTrigger value="create">Crear Creador</TabsTrigger>
                <TabsTrigger value="import">Importar Creadores</TabsTrigger>
                <TabsTrigger value="summary">Resumen Creadores</TabsTrigger>
                {selectedCreator && (
                  <TabsTrigger value="detail">Detalle del Creador</TabsTrigger>
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
                  <h2 className="text-xl font-semibold mb-6">Agregar Nuevo Creador</h2>
                  <CreatorForm 
                    onSuccess={() => {
                      setActiveTab("list");
                    }} 
                  />
                </div>
              </TabsContent>

              <TabsContent value="import" className="space-y-6">
                <ImportCreators onSuccess={() => {
                  refetch();
                  toast.success("Creadores importados correctamente");
                }} />
              </TabsContent>
              
              <TabsContent value="summary" className="space-y-6">
                <CreatorsSummary />
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
