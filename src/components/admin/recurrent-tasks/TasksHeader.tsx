
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function TasksHeader() {
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['recurrent-tasks-summary']
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tareas Recurrentes</h1>
        <p className="text-muted-foreground">
          Configura y monitorea el estado de las tareas programadas
        </p>
      </div>
      <Button onClick={handleRefresh} variant="outline" size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Actualizar
      </Button>
    </div>
  );
}
