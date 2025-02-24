
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatesList } from "@/components/creator-rates/RatesList";
import { CreatorSearch } from "@/components/creator-rates/CreatorSearch";
import { RatesImportTab } from "@/components/creator-rates/RatesImportTab";

interface Creator {
  id: string;
  email: string;
  full_name: string | null;
}

export default function CreatorRates() {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Tarifas de Creadores</h1>

            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">Lista de Tarifas</TabsTrigger>
                <TabsTrigger value="add">Agregar Tarifa</TabsTrigger>
                <TabsTrigger value="import">Importar Tarifas</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <RatesList page={page} itemsPerPage={itemsPerPage} />
              </TabsContent>

              <TabsContent value="add">
                <CreatorSearch
                  selectedCreator={selectedCreator}
                  onCreatorSelect={setSelectedCreator}
                />
              </TabsContent>

              <TabsContent value="import">
                <RatesImportTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
