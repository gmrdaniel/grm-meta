
import { useState } from "react";
import { TasksList } from "./TasksList";
import { TaskDetail } from "./TaskDetail";
import { TasksHeader } from "./TasksHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTasksToProcess, executeTask } from "@/services/recurrentTasksService";
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function RecurrentTasksManager() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isRunningTasks, setIsRunningTasks] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['recurrent-tasks-summary'],
    queryFn: fetchTasksToProcess
  });

  const { mutate: runTask } = useMutation({
    mutationFn: (taskId: string) => {
      setIsRunningTasks(prev => ({ ...prev, [taskId]: true }));
      setProgress(prev => ({ ...prev, [taskId]: 0 }));
      
      return executeTask(taskId, {
        onProgress: (processed, total) => {
          const newProgress = Math.round((processed / total) * 100);
          setProgress(prev => ({ ...prev, [taskId]: newProgress }));
        }
      });
    },
    onSuccess: (_, taskId) => {
      setIsRunningTasks(prev => ({ ...prev, [taskId]: false }));
      toast.success("Tarea completada exitosamente");
      queryClient.invalidateQueries({
        queryKey: ['recurrent-tasks-summary']
      });
    },
    onError: (error, taskId) => {
      setIsRunningTasks(prev => ({ ...prev, [taskId]: false }));
      toast.error(`Error al ejecutar la tarea: ${error.message}`);
    }
  });

  const handleRunTask = (taskId: string) => {
    if (isRunningTasks[taskId]) return;
    runTask(taskId);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['recurrent-tasks-summary']
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tareas Recurrentes</h1>
          <p className="text-muted-foreground">
            Configura y monitorea el estado de las tareas programadas
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <TasksList 
                tasks={tasksData?.tasks || []} 
                selectedTaskId={selectedTaskId}
                onSelectTask={setSelectedTaskId}
              />
            )}
          </Card>
        </div>
        
        <div className="md:col-span-2">
          {selectedTaskId ? (
            <TaskDetail taskId={selectedTaskId} />
          ) : (
            <Card className="p-6">
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Tareas disponibles</h2>
                
                {isLoading ? (
                  <div className="flex justify-center items-center h-20">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                  </div>
                ) : tasksData?.tasks && tasksData.tasks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Último estado</TableHead>
                        <TableHead>Próxima ejecución</TableHead>
                        <TableHead>Pendientes</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasksData.tasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {task.lastRunStatus ? (
                                <>
                                  {getStatusIcon(task.lastRunStatus)}
                                  <span className="ml-2">{task.lastRunStatus}</span>
                                </>
                              ) : (
                                "No ejecutada"
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {task.nextRunAt ? (
                              formatDistanceToNow(new Date(task.nextRunAt), { 
                                locale: es, 
                                addSuffix: true 
                              })
                            ) : (
                              "No programada"
                            )}
                          </TableCell>
                          <TableCell>{task.pendingCount || 0}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled={isRunningTasks[task.id] || task.pendingCount === 0}
                              onClick={() => handleRunTask(task.id)}
                            >
                              {isRunningTasks[task.id] ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  {progress[task.id] || 0}%
                                </>
                              ) : (
                                "Ejecutar"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No hay tareas configuradas</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
