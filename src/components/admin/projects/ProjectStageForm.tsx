import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchProjectStages, createProjectStage, updateProjectStage } from "@/services/projectService";
import { ProjectStage } from "@/types/project";

const formSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  slug: z.string().min(3, { message: "El slug debe tener al menos 3 caracteres" }),
  url: z.string().min(1, { message: "La URL es obligatoria" }),
  view: z.string().min(1, { message: "La vista es obligatoria" }),
  responsible: z.enum(["system", "creator", "admin"], {
    required_error: "Debe seleccionar un responsable",
  }),
  response_positive: z.string().optional(),
  response_negative: z.string().optional()
});

interface ProjectStageFormProps {
  projectId: string;
  onSuccess: () => void;
  defaultValues?: z.infer<typeof formSchema> & { order_index?: number };
  stageId?: string;
}

export function ProjectStageForm({ projectId, onSuccess, defaultValues, stageId }: ProjectStageFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!stageId;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      slug: "",
      url: "",
      view: "",
      responsible: "system",
      response_positive: "",
      response_negative: ""
    }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      
      // Get next order index if creating new stage
      let orderIndex = defaultValues?.order_index || 1;
      
      if (!isEditing) {
        const stages = await fetchProjectStages(projectId);
        orderIndex = stages.length > 0 ? Math.max(...stages.map(s => s.order_index)) + 1 : 1;
      }
      
      if (isEditing && stageId) {
        await updateProjectStage(stageId, {
          ...values,
          project_id: projectId
        });
        toast.success("Etapa actualizada correctamente");
      } else {
        await createProjectStage({
          name: values.name,
          slug: values.slug,
          url: values.url,
          view: values.view,
          responsible: values.responsible,
          response_positive: values.response_positive,
          response_negative: values.response_negative,
          project_id: projectId,
          order_index: orderIndex
        });
        toast.success("Etapa creada correctamente");
      }
      
      form.reset();
      onSuccess();
    } catch (error: any) {
      toast.error(`Error al ${isEditing ? "actualizar" : "crear"} etapa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Etapa" : "Crear Nueva Etapa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Etapa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Revisión de Solicitud" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: revision-solicitud" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/projects/review" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="view"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vista</FormLabel>
                    <FormControl>
                      <Input placeholder="ReviewView" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="responsible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar responsable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="system">Sistema</SelectItem>
                      <SelectItem value="creator">Creador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="response_positive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vista Siguiente (Positivo)</FormLabel>
                    <FormControl>
                      <Input placeholder="ApprovalView" {...field} value={field.value || ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="response_negative"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vista Siguiente (Negativo)</FormLabel>
                    <FormControl>
                      <Input placeholder="RejectionView" value={field.value || ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading && (
                <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              )}
              {isEditing ? "Actualizar Etapa" : "Crear Etapa"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
