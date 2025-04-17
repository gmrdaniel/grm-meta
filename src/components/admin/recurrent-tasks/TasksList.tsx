
import { Button } from "@/components/ui/button";
import { 
  TikTok, 
  Youtube, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { RecurrentTask } from "@/types/recurrent-tasks";

interface TasksListProps {
  tasks: RecurrentTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

export function TasksList({ tasks, selectedTaskId, onSelectTask }: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay tareas configuradas</p>
      </div>
    );
  }

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'tikTokVideos':
        return <TikTok className="h-5 w-5" />;
      case 'youTubeShorts':
        return <Youtube className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
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
    <div className="space-y-2">
      <h2 className="text-lg font-medium mb-4">Tareas Disponibles</h2>
      {tasks.map((task) => (
        <Button
          key={task.id}
          variant={selectedTaskId === task.id ? "default" : "outline"}
          className="w-full justify-start mb-2 relative"
          onClick={() => onSelectTask(task.id)}
        >
          <div className="flex items-center">
            <span className="mr-3">{getTaskIcon(task.type)}</span>
            <span className="mr-2">{task.name}</span>
            {task.lastRunStatus && (
              <span className="absolute right-3">{getStatusIcon(task.lastRunStatus)}</span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}
