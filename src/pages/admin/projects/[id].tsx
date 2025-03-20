
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ProjectDetail } from "@/components/admin/projects/ProjectDetail";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/types/project";

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        
        // Mock data
        const mockProject: Project = {
          id: id,
          name: "Sample Project",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProject(mockProject);
      } catch (error: any) {
        toast.error(`Error al cargar el proyecto: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/projects")}
              className="mb-4"
            >
              <ChevronLeft size={16} className="mr-1" /> Volver
            </Button>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : project ? (
              <ProjectDetail project={project} />
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <h2 className="text-lg font-medium">Proyecto no encontrado</h2>
                <p className="text-gray-500 mt-2">
                  El proyecto que buscas no existe o no tienes permisos para verlo
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
