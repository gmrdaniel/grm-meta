
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fetchTaskById, updateTaskStatus } from "@/services/tasksService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface TaskDetailProps {
  taskId: string;
}

export function TaskDetail({ taskId }: TaskDetailProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { data: task, isLoading, error, refetch } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => fetchTaskById(taskId),
  });

  const handleStatusUpdate = async (newStatus: 'pending' | 'in_progress' | 'completed' | 'review') => {
    if (!task || task.status === newStatus) return;
    
    setIsUpdating(true);
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Task status updated successfully");
      refetch();
    } catch (error) {
      toast.error(`Failed to update task status: ${(error as Error).message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'review':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading task: {(error as Error).message}</div>;
  }

  if (!task) {
    return <div className="text-center p-8 text-gray-500">Task not found</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
            {getStatusBadge(task.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
            <p className="text-gray-800">
              {task.description || "No description provided"}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Project</h3>
              <p className="text-gray-800">{task.project_name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Stage</h3>
              <p className="text-gray-800">{task.stage_name || "Not assigned"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
              <p className="text-gray-800">{format(new Date(task.created_at), 'PPP')}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-gray-800">{format(new Date(task.updated_at), 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={task.status === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('pending')}
              disabled={isUpdating || task.status === 'pending'}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Pending
            </Button>
            <Button 
              variant={task.status === 'in_progress' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={isUpdating || task.status === 'in_progress'}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              In Progress
            </Button>
            <Button 
              variant={task.status === 'review' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('review')}
              disabled={isUpdating || task.status === 'review'}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              Review
            </Button>
            <Button 
              variant={task.status === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating || task.status === 'completed'}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Completed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
