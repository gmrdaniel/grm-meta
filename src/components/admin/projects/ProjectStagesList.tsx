
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ProjectStage {
  id: string;
  project_id: string;
  name: string;
  url: string;
  view: string;
  responsible: "system" | "creator";
  next_positive_view?: string;
  next_negative_view?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

interface ProjectStagesListProps {
  projectId: string;
  onStageOrderUpdated?: () => void;
}

export function ProjectStagesList({ projectId, onStageOrderUpdated }: ProjectStagesListProps) {
  const [stages, setStages] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchStages = async () => {
      try {
        setLoading(true);
        
        // For now, we'll mock the data since we don't have database access yet
        // In a real implementation, we would fetch from the project_stages table
        const mockStages: ProjectStage[] = [
          {
            id: "1",
            project_id: projectId,
            name: "Solicitud",
            url: "/projects/request",
            view: "RequestView",
            responsible: "creator",
            next_positive_view: "ReviewView",
            next_negative_view: undefined,
            order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "2",
            project_id: projectId,
            name: "Revisión",
            url: "/projects/review",
            view: "ReviewView",
            responsible: "system",
            next_positive_view: "ApprovalView",
            next_negative_view: "RejectionView",
            order: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: "3",
            project_id: projectId,
            name: "Aprobación",
            url: "/projects/approval",
            view: "ApprovalView",
            responsible: "system",
            next_positive_view: "ImplementationView",
            next_negative_view: "RejectionView",
            order: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        setStages(mockStages.sort((a, b) => a.order - b.order));
      } catch (error: any) {
        toast.error(`Error al cargar etapas: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, [projectId]);
  
  const handleMoveStage = async (stageId: string, direction: 'up' | 'down') => {
    try {
      const stageIndex = stages.findIndex(stage => stage.id === stageId);
      if (stageIndex === -1) return;
      
      const newStages = [...stages];
      
      if (direction === 'up' && stageIndex > 0) {
        // Swap with previous
        const temp = newStages[stageIndex - 1];
        newStages[stageIndex - 1] = { ...newStages[stageIndex], order: newStages[stageIndex].order - 1 };
        newStages[stageIndex] = { ...temp, order: temp.order + 1 };
      } else if (direction === 'down' && stageIndex < stages.length - 1) {
        // Swap with next
        const temp = newStages[stageIndex + 1];
        newStages[stageIndex + 1] = { ...newStages[stageIndex], order: newStages[stageIndex].order + 1 };
        newStages[stageIndex] = { ...temp, order: temp.order - 1 };
      } else {
        return; // Can't move further
      }
      
      // Sort by order
      newStages.sort((a, b) => a.order - b.order);
      setStages(newStages);
      
      // This would update the order in the database in a real implementation
      // For now we'll just show a success message
      toast.success("Orden de etapas actualizado");
      if (onStageOrderUpdated) {
        onStageOrderUpdated();
      }
    } catch (error: any) {
      toast.error(`Error al reordenar etapas: ${error.message}`);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      // This would delete the stage from the database in a real implementation
      const newStages = stages.filter(stage => stage.id !== stageId);
      
      // Re-calculate order
      const orderedStages = newStages.map((stage, index) => ({
        ...stage,
        order: index + 1
      }));
      
      setStages(orderedStages);
      toast.success("Etapa eliminada correctamente");
      if (onStageOrderUpdated) {
        onStageOrderUpdated();
      }
    } catch (error: any) {
      toast.error(`Error al eliminar etapa: ${error.message}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Vista</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Siguiente (Positivo)</TableHead>
              <TableHead>Siguiente (Negativo)</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                  </div>
                </TableCell>
              </TableRow>
            ) : stages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No hay etapas creadas aún
                </TableCell>
              </TableRow>
            ) : (
              stages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>{stage.order}</TableCell>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell className="text-sm">{stage.url}</TableCell>
                  <TableCell>{stage.view}</TableCell>
                  <TableCell>
                    {stage.responsible === "system" ? "Sistema" : "Creador"}
                  </TableCell>
                  <TableCell>{stage.next_positive_view || '-'}</TableCell>
                  <TableCell>{stage.next_negative_view || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleMoveStage(stage.id, 'up')}
                        disabled={stage.order === 1}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleMoveStage(stage.id, 'down')}
                        disabled={stage.order === stages.length}
                      >
                        <ArrowDown size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteStage(stage.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
