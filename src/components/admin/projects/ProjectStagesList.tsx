
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash } from "lucide-react";
import { toast } from "sonner";
import { ProjectStage } from "@/types/project";
import { fetchProjectStages, updateProjectStage, deleteProjectStage } from "@/services/projectService";
import { useQuery } from "@tanstack/react-query";

interface ProjectStagesListProps {
  projectId: string;
  onStageOrderUpdated?: () => void;
}

export function ProjectStagesList({ projectId, onStageOrderUpdated }: ProjectStagesListProps) {
  const { data: stages, isLoading, error, refetch } = useQuery({
    queryKey: ['project-stages', projectId],
    queryFn: () => fetchProjectStages(projectId)
  });
  
  const handleMoveStage = async (stageId: string, direction: 'up' | 'down') => {
    if (!stages) return;
    
    try {
      const stageIndex = stages.findIndex(stage => stage.id === stageId);
      if (stageIndex === -1) return;
      
      if (direction === 'up' && stageIndex > 0) {
        const currentStage = stages[stageIndex];
        const prevStage = stages[stageIndex - 1];
        
        await updateProjectStage(currentStage.id, { order_index: prevStage.order_index });
        await updateProjectStage(prevStage.id, { order_index: currentStage.order_index });
        
      } else if (direction === 'down' && stageIndex < stages.length - 1) {
        const currentStage = stages[stageIndex];
        const nextStage = stages[stageIndex + 1];
        
        await updateProjectStage(currentStage.id, { order_index: nextStage.order_index });
        await updateProjectStage(nextStage.id, { order_index: currentStage.order_index });
      } else {
        return; // Can't move further
      }
      
      toast.success("Orden de etapas actualizado");
      await refetch();
      
      if (onStageOrderUpdated) {
        onStageOrderUpdated();
      }
    } catch (error: any) {
      toast.error(`Error al reordenar etapas: ${error.message}`);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await deleteProjectStage(stageId);
      toast.success("Etapa eliminada correctamente");
      await refetch();
      
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-red-500">
                  Error al cargar etapas: {(error as Error).message}
                </TableCell>
              </TableRow>
            ) : stages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No hay etapas creadas aún
                </TableCell>
              </TableRow>
            ) : (
              stages?.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>{stage.order_index}</TableCell>
                  <TableCell className="font-medium">{stage.name}</TableCell>
                  <TableCell className="text-sm">{stage.url}</TableCell>
                  <TableCell>{stage.view}</TableCell>
                  <TableCell>
                    {stage.responsible === "system" ? "Sistema" : 
                     stage.responsible === "creator" ? "Creador" : "Admin"}
                  </TableCell>
                  <TableCell>{stage.response_positive || '-'}</TableCell>
                  <TableCell>{stage.response_negative || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleMoveStage(stage.id, 'up')}
                        disabled={stage.order_index === 1}
                      >
                        <ArrowUp size={16} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleMoveStage(stage.id, 'down')}
                        disabled={stages && stage.order_index === stages.length}
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
