import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateEventProps {
  onSuccess?: () => void;
}

// Define el esquema del formulario de eventos
const formSchema = z.object({
projectId: z.string().min(1, "You must select a project"),
eventName: z.string().min(1, "The event name is required"),
description: z.string().optional(),
deadline: z.string().optional(), // Date in ISO format
linkTerms: z.string().url("Must be a valid URL").optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateEvent: React.FC<CreateEventProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Inicializar formulario de eventos
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      eventName: "",
      description: "",
      deadline: "",
      linkTerms: "",
    },
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Función para obtener proyectos desde Supabase
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");

      if (error) {
        toast.error("Error loading projects");
        console.error(error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Error loading projects");
    }
  };

  // Función para crear un nuevo evento
  const createEvent = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Primero verificamos si la tabla tiene los campos adicionales
      // Si no existen, solo insertamos los campos básicos
      const { data, error } = await supabase
        .from("invitation_events")
        .insert({
          id_project: values.projectId,
          event_name: values.eventName,
          description: values.description || null,
          deadline: values.deadline
            ? new Date(values.deadline).toISOString()
            : null,
          link_terms: values.linkTerms || null,
        })
        .select()
        .single();

      if (error) {
        // Si hay un error porque los campos adicionales no existen,
        // intentamos insertar solo los campos básicos
        if (error.code === "42703") {
          // Código para columna inexistente en PostgreSQL
          const { data: basicData, error: basicError } = await supabase
            .from("invitation_events")
            .insert({
              id_project: values.projectId,
              event_name: values.eventName,
            })
            .select()
            .single();

          if (basicError) {
            throw basicError;
          }

          toast.success("Event created successfully (with basic fields only)");
          form.reset();
          onSuccess?.();
          return;
        }
        throw error;
      }

      toast.success("Event created successfully");
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error(`Error creating event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 min-w-full ">
      <div className="transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(createEvent)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects?.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <Input
                    {...field}
                    placeholder="Event Name"
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    {...field}
                    placeholder="Event Description"
                    disabled={isSubmitting}
                    rows={4}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

           <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline date</FormLabel>
                  <Input
                    {...field}
                    type="date"
                    disabled={isSubmitting}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <Input
                    {...field}
                    placeholder="https://ejemplo.com/terminos"
                    disabled={isSubmitting}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreateEvent;
