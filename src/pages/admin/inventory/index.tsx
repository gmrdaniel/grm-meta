
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorsList } from "@/components/admin/inventory/CreatorsList";
import { CreatorForm } from "@/components/admin/inventory/CreatorForm";

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState("list");

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
              </TabsList>
              
              <TabsContent value="list" className="space-y-6">
                <CreatorsList />
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
