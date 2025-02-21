
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Plus } from "lucide-react";
import { ServicesTable } from "@/components/services/ServicesTable";
import { ServiceForm } from "@/components/services/ServiceForm";
import { Service } from "@/types/services";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) throw error;
      
      const typedServices = data?.map(service => ({
        ...service,
        type: service.type as 'único' | 'recurrente' | 'contrato'
      })) || [];
      
      setServices(typedServices);
    } catch (error: any) {
      toast.error("Error al cargar los servicios");
      console.error("Error:", error.message);
    }
  }

  async function handleSubmit(data: Omit<Service, "id">) {
    setLoading(true);
    try {
      if (editingService) {
        const { error } = await supabase
          .from("services")
          .update(data)
          .eq("id", editingService.id);

        if (error) throw error;
        toast.success("Servicio actualizado correctamente");
      } else {
        const { error } = await supabase
          .from("services")
          .insert(data);

        if (error) throw error;
        toast.success("Servicio creado correctamente");
      }

      setEditingService(null);
      setActiveTab("list");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Servicio eliminado correctamente");
      fetchServices();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setActiveTab("form");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Administrar Servicios</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Lista de Servicios
                </TabsTrigger>
                <TabsTrigger value="form" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {editingService ? "Editar Servicio" : "Añadir Nuevo Servicio"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-0">
                <ServicesTable 
                  services={services} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </TabsContent>

              <TabsContent value="form" className="mt-0">
                <div className="bg-white p-6 rounded-lg shadow">
                  <ServiceForm 
                    initialData={editingService || undefined}
                    onSubmit={handleSubmit}
                    isLoading={loading}
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
