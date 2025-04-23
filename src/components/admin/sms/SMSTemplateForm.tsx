import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  message: string;
  project_id: string | null;
}

interface SMSTemplateFormProps {
  initialData?: Template;
  onSuccess?: () => void;
}

export function SMSTemplateForm({ initialData, onSuccess }: SMSTemplateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(initialData?.name || "");
  const [projectId, setProjectId] = useState(initialData?.project_id || "");
  const [message, setMessage] = useState(initialData?.message || "");

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (initialData) {
        // Update existing template
        const { error } = await supabase
          .from('sms_templates')
          .update({
            name,
            project_id: projectId,
            message
          })
          .eq('id', initialData.id);

        if (error) throw error;
        toast.success("Plantilla actualizada exitosamente");
      } else {
        // Create new template
        const { error } = await supabase
          .from('sms_templates')
          .insert({
            name,
            project_id: projectId,
            message
          });

        if (error) throw error;
        toast.success("Plantilla guardada exitosamente");
      }

      onSuccess?.();
      if (!initialData) {
        setName("");
        setProjectId("");
        setMessage("");
      }
    } catch (error: any) {
      toast.error(`Error al ${initialData ? 'actualizar' : 'guardar'} la plantilla: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-6">
        {initialData ? "Editar" : "Crear"} Plantilla SMS
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la plantilla</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Bienvenida"
              required
            />
          </div>

          <div>
            <Label htmlFor="project">Proyecto</Label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            >
              <option value="">Seleccionar proyecto</option>
              {projects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <div className="mb-2 text-sm text-gray-500">
              Puedes usar las variables {"{nombre}"} y {"{link_invitation}"} en tu mensaje
            </div>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="min-h-[100px]"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 
            (initialData ? "Actualizando..." : "Guardando...") : 
            (initialData ? "Actualizar plantilla" : "Guardar plantilla")
          }
        </Button>
      </form>
    </div>
  );
}
