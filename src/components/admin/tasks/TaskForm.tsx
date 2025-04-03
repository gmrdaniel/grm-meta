
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchProjects } from "@/services/projectService";
import { createTask } from "@/services/tasksService";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskFormProps {
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  project_id?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  creator_invitation_id?: string;
}

export function TaskForm({ onSuccess }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: "",
      status: "pending",
      project_id: undefined,
      creator_invitation_id: undefined
    }
  });
  
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });
  
  const activeProjects = projects?.filter(p => p.status !== 'archived') || [];
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // If there's no project_id, don't send the project_id field
      const dataToSubmit = {
        ...values,
        project_id: values.project_id || undefined,
        creator_invitation_id: values.creator_invitation_id || undefined,
      };
      
      const taskData = {
        ...dataToSubmit,
        stage_id: "00000000-0000-0000-0000-000000000000" // This will be replaced with actual stage_id when project_id is provided
      };
      
      if (taskData.project_id) {
        // If we have a project, we need to fetch the first stage for it
        // For now we're skipping this part but in a real implementation
        // you would fetch the first stage from the project and use its ID
      }
      
      await createTask(taskData);
      toast.success("Tarea creada exitosamente");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear la tarea");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Tarea</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ingrese el título de la tarea" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proyecto (Opcional)</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projectsLoading ? (
                        <SelectItem value="loading" disabled>
                          Cargando proyectos...
                        </SelectItem>
                      ) : activeProjects.length > 0 ? (
                        activeProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>
                          No hay proyectos activos
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estatus</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estatus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En Progreso</SelectItem>
                      <SelectItem value="completed">Completada</SelectItem>
                      <SelectItem value="review">En Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="creator_invitation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Invitación (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ID de la invitación del creador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Tarea"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
