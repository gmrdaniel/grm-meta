
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskForm } from "@/components/admin/tasks/TaskForm";

export default function AdminTaskCreate() {
  const [activeTab, setActiveTab] = useState("create");
  const navigate = useNavigate();
  
  // Redirect to main tasks page if needed
  useEffect(() => {
    // Uncomment the line below if you want automatic redirection
    // navigate("/admin/tasks");
  }, [navigate]);
  
  return (
    <Layout>
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl font-bold">Administración de Tareas</h1>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => navigate("/admin/tasks")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Volver a Lista de Tareas
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-6">
                <TabsList className="w-full max-w-xs">
                  <TabsTrigger value="create" className="flex-1">
                    Crear Tarea
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
