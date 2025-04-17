
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchProcessingProgress } from "@/components/admin/inventory/creators-list/BatchProcessingProgress";
import { Play, Clock, RotateCcw, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTaskDetail, executeTask } from "@/services/recurrentTasksService";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface TaskDetailProps {
  taskId: string | null;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ['recurrent-task', taskId],
    queryFn: () => fetchTaskDetail(taskId!),
    enabled: !!taskId
  });

  const { mutate: runTask, isPending } = useMutation({
    mutationFn: executeTask,
    onSuccess: () => {
      toast.success("Tarea completada exitosamente");
      setIsRunning(false);
      queryClient.invalidateQueries({
        queryKey: ['recurrent-task', taskId]
      });
      queryClient.invalidateQueries({
        queryKey: ['recurrent-tasks-summary']
      });
    },
    onError: (error) => {
      toast.error(`Error al ejecutar la tarea: ${error.message}`);
      setIsRunning(false);
    }
  });

  const handleRunTask = () => {
    if (!task) return;
    
    setIsRunning(true);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(task.pendingCount || 0);
    
    runTask(task.id, {
      onProgress: (processed, total) => {
        const newProgress = Math.round((processed / total) * 100);
        setProgress(newProgress);
        setProcessedCount(processed);
        setTotalCount(total);
      }
    });
  };

  if (!taskId) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center text-muted-foreground">
          <p>Selecciona una tarea para ver los detalles</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center">
          <Clock className="h-10 w-10 text-muted-foreground animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando detalles...</p>
        </CardContent>
      </Card>
    );
  }

  if (!task) {
    return (
      <Card className="h-full flex items-center justify-center min-h-[300px]">
        <CardContent className="text-center text-muted-foreground">
          <p>Tarea no encontrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task.name}</CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span>Estado</span>
            </div>
            <p className="font-medium">{task.lastRunStatus || "No ejecutada"}</p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <RotateCcw className="h-4 w-4 mr-2" />
              <span>Última ejecución</span>
            </div>
            <p className="font-medium">
              {task.lastRunAt 
                ? `Hace ${formatDistanceToNow(new Date(task.lastRunAt), { locale: es })}` 
                : "Nunca"}
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Próxima ejecución</span>
            </div>
            <p className="font-medium">
              {task.nextRunAt 
                ? formatDistanceToNow(new Date(task.nextRunAt), { locale: es, addSuffix: true }) 
                : "No programada"}
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span>Registros pendientes</span>
            </div>
            <p className="font-medium">{task.pendingCount || 0}</p>
          </div>
        </div>

        {isRunning && (
          <BatchProcessingProgress 
            operationType={task.type}
            progress={progress}
            processedCount={processedCount}
            totalCount={totalCount}
          />
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRunTask} 
          disabled={isPending || isRunning || task.pendingCount === 0}
          className="w-full"
        >
          <Play className="h-4 w-4 mr-2" />
          Ejecutar ahora
        </Button>
      </CardFooter>
    </Card>
  );
}
