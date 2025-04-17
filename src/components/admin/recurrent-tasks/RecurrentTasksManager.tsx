
import { useState } from "react";
import { TasksList } from "./TasksList";
import { TaskDetail } from "./TaskDetail";
import { TasksHeader } from "./TasksHeader";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchTasksToProcess } from "@/services/recurrentTasksService";
import { Loader2 } from "lucide-react";

export function RecurrentTasksManager() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['recurrent-tasks-summary'],
    queryFn: fetchTasksToProcess
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TasksHeader />
      
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
          <TaskDetail taskId={selectedTaskId} />
        </div>
      </div>
    </div>
  );
}
