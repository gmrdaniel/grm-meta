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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import { Event } from "@/services/events/eventService";

interface EditEventProps {
  event: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Define el esquema del formulario de eventos
const formSchema = z.object({
  projectId: z.string().min(1, "You must select a project"),
  eventName: z.string().min(1, "Event name is required"),
  description: z.string().optional(),
  deadline: z.string().optional(), // Date in ISO format
  linkTerms: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const EditEvent: React.FC<EditEventProps> = ({
  event,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  // Inicializar formulario de eventos con los datos del evento existente
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: event.id_project || "",
      eventName: event.event_name || "",
      description: event.description || "",
      deadline: event.deadline
        ? new Date(event.deadline).toISOString().split("T")[0]
        : "",
      linkTerms: event.link_terms || "",
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
        toast.error("Error al cargar los proyectos");
        console.error(error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
      toast.error("Error loading projects");
    }
  };

  // Función para actualizar un evento existente
  const updateEvent = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("invitation_events")
        .update({
          id_project: values.projectId,
          event_name: values.eventName,
          description: values.description || null,
          deadline: values.deadline
            ? new Date(values.deadline).toISOString()
            : null,
          link_terms: values.linkTerms || null,
        })
        .eq("id", event.id);

      if (error) throw error;

      toast.success("Event updated successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Error al actualizar evento:", error);
      toast.error(`Error updating event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Edit Event</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(updateEvent)}>
          <CardContent className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proyect</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a project" />
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
                  <FormLabel>Deadline</FormLabel>
                  <Input {...field} type="date" disabled={isSubmitting} />
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
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default EditEvent;
