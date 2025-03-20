
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectStagesList } from "./ProjectStagesList";
import { ProjectStageForm } from "./ProjectStageForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Project } from "@/types/project";

interface ProjectDetailProps {
  project: Project;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectStatus, setProjectStatus] = useState(project.status);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("stages");
  const [reload, setReload] = useState(0);

  const handleUpdateProject = async () => {
    try {
      setLoading(true);
      
      // Since we can't access the Supabase database yet, we'll just mock the update
      console.log("Updating project:", {
        id: project.id,
        name: projectName,
        status: projectStatus
      });
      
      // Mock API delay
      setTimeout(() => {
        toast.success("Proyecto actualizado correctamente");
        setIsEditing(false);
        setLoading(false);
      }, 1000);
      
    } catch (error: any) {
      toast.error(`Error al actualizar proyecto: ${error.message}`);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'draft':
        return <Badge variant="outline">Borrador</Badge>;
      case 'active':
        return <Badge className="bg-green-500">Activo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-2xl font-semibold border-b border-gray-300 focus:outline-none"
                />
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as Project["status"])}
                  className="border rounded p-1 text-sm"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CardTitle>{project.name}</CardTitle>
                {getStatusBadge(project.status)}
              </div>
            )}
          </div>
          
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  <X size={16} />
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleUpdateProject}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save size={16} />
                  )}
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setIsEditing(true)}
              >
                <Edit size={16} className="mr-1" /> Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Creado: {new Date(project.created_at).toLocaleString()}</span>
            <span>Actualizado: {new Date(project.updated_at).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="stages">Etapas del Proyecto</TabsTrigger>
          <TabsTrigger value="add-stage">Añadir Etapa</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stages">
          <ProjectStagesList 
            projectId={project.id} 
            key={`stages-list-${reload}`}
            onStageOrderUpdated={() => setReload(prev => prev + 1)}
          />
        </TabsContent>
        
        <TabsContent value="add-stage">
          <ProjectStageForm 
            projectId={project.id} 
            onSuccess={() => {
              setActiveTab("stages");
              setReload(prev => prev + 1);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
