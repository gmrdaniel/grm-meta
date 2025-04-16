
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusUpdater } from "@/components/admin/inventory-stats/StatusUpdater";

export default function AdminInventoryStats() {
  const [activeTab, setActiveTab] = useState("status-update");
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">Estadísticas de Inventario de Creadores</h1>
            
            <Tabs defaultValue="status-update" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="status-update">Actualizar Estado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="status-update" className="space-y-6">
                <StatusUpdater />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
