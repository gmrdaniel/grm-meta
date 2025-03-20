
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ProjectDetail } from "@/components/admin/projects/ProjectDetail";
import { ProjectForm } from "@/components/admin/projects/ProjectForm";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/types/project";
import { fetchProjectById } from "@/services/projectService";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shouldEdit = searchParams.get('edit') === 'true';
  const [activeTab, setActiveTab] = useState(shouldEdit ? "edit" : "view");
  
  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => id ? fetchProjectById(id) : Promise.reject(new Error('No project ID provided')),
    enabled: !!id
  });
  
  useEffect(() => {
    if (error) {
      toast.error(`Error al cargar el proyecto: ${(error as Error).message}`);
    }
  }, [error]);

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
            
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : project ? (
              shouldEdit ? (
                <ProjectForm 
                  projectId={id}
                  defaultValues={project ? {
                    name: project.name,
                    status: project.status
                  } : undefined}
                  onSuccess={() => {
                    navigate(`/admin/projects/${id}`);
                    refetch();
                  }}
                />
              ) : (
                <ProjectDetail 
                  project={project} 
                  onProjectUpdated={() => refetch()}
                />
              )
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
