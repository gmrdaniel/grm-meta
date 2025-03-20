
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectsList } from "@/components/admin/projects/ProjectsList";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";

export default function AdminProjects() {
  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold mb-6">Gestión de Proyectos</h1>
            
            <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">Lista de Proyectos</TabsTrigger>
                <TabsTrigger value="create">Crear Proyecto</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-6">
                <ProjectsList />
              </TabsContent>
              
              <TabsContent value="create" className="space-y-6">
                <ProjectForm onSuccess={() => setActiveTab("list")} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
