
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/admin/tasks/TaskForm";

export default function AdminTaskCreate() {
  const [activeTab, setActiveTab] = useState("create");
  
  return (
    <Layout>
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">Administración de Tareas</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6">
                <TabsList className="w-full max-w-xs">
                  <TabsTrigger value="create" className="flex-1">
                    Tareas
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="create" className="space-y-6">
                <TaskForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
