import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  projectId: z.string().min(1, "Debes seleccionar un proyecto"),
  eventName: z.string().min(1, "El nombre del evento es obligatorio"),
  description: z.string().optional(),
  deadline: z.string().optional(), // Fecha en formato ISO
  linkTerms: z.string().url("Debe ser una URL válida").optional(),
});

// Define el esquema del formulario de notificaciones
const notificationFormSchema = z.object({
  invitation_event_id: z.string(),
  campaign_name: z.string().min(1, "El nombre de la campaña es obligatorio"),
  type: z.enum(["notification", "reminder", "alert"]),
  subject: z.string().min(1, "El asunto es obligatorio"),
  message: z.string().min(1, "El mensaje es obligatorio"),
  channel: z.enum(["email", "sms"]),
});

type FormValues = z.infer<typeof formSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const CreateEvent: React.FC<CreateEventProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string>("");
  const [createdEventName, setCreatedEventName] = useState<string>("");

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

  // Inicializar formulario de notificaciones
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      invitation_event_id: "",
      campaign_name: "",
      type: "notification",
      subject: "",
      message: "",
      channel: "email",
    },
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Actualizar el valor de invitation_event_id cuando cambia createdEventId
  useEffect(() => {
    if (createdEventId) {
      notificationForm.setValue("invitation_event_id", createdEventId);
    }
  }, [createdEventId, notificationForm]);

  // Función para obtener proyectos desde Supabase
  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) {
        toast.error('Error al cargar los proyectos');
        console.error(error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      toast.error('Error al cargar los proyectos');
    }
  };

  // Función para crear un nuevo evento
  const createEvent = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Primero verificamos si la tabla tiene los campos adicionales
      // Si no existen, solo insertamos los campos básicos
      const { data, error } = await supabase
        .from('invitation_events')
        .insert({
          id_project: values.projectId,
          event_name: values.eventName,
          description: values.description || null,
          deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
          link_terms: values.linkTerms || null,
        })
        .select()
        .single();

      if (error) {
        // Si hay un error porque los campos adicionales no existen,
        // intentamos insertar solo los campos básicos
        if (error.code === '42703') { // Código para columna inexistente en PostgreSQL
          const { data: basicData, error: basicError } = await supabase
            .from('invitation_events')
            .insert({
              id_project: values.projectId,
              event_name: values.eventName,
            })
            .select()
            .single();

          if (basicError) {
            throw basicError;
          }

          // Guardamos el ID del evento creado y mostramos el formulario de notificación
          setCreatedEventId(basicData.id);
          setCreatedEventName(basicData.event_name);
          setShowNotificationForm(true);
          toast.success('Evento creado exitosamente (solo con campos básicos)');
          form.reset();
          return;
        }
        throw error;
      }

      // Guardamos el ID del evento creado y mostramos el formulario de notificación
      setCreatedEventId(data.id);
      setCreatedEventName(data.event_name);
      setShowNotificationForm(true);
      toast.success('Evento creado exitosamente');
      form.reset();
    } catch (error) {
      console.error('Error al crear evento:', error);
      toast.error(`Error al crear evento: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para crear la configuración de notificación
  const createNotificationSettings = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .insert({
          invitation_event_id: values.invitation_event_id,
          campaign_name: values.campaign_name,
          type: values.type,
          subject: values.subject,
          message: values.message,
          channel: values.channel,
          enabled: true, // Por defecto habilitado
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success('Configuración de notificación creada exitosamente');
      notificationForm.reset();
      setShowNotificationForm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear configuración de notificación:', error);
      toast.error(`Error al crear configuración de notificación: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showNotificationForm ? (
        <div className="transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Crear Nuevo Evento</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(createEvent)} className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proyecto</FormLabel>
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
                    <FormLabel>Nombre del Evento</FormLabel>
                    <Input
                      {...field}
                      placeholder="Nombre del evento"
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
                    <FormLabel>Descripción</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Descripción del evento"
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
                    <FormLabel>Fecha límite</FormLabel>
                    <Input
                      {...field}
                      type="date"
                      disabled={isSubmitting}
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
                    <FormLabel>Enlace</FormLabel>
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
                {isSubmitting ? "Creando..." : "Crear Evento"}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <div className="transition-all duration-300 ease-in-out">
          <h2 className="text-xl font-bold mb-4">Configurar Notificación para el Evento</h2>
          <p className="mb-4 text-sm text-gray-600">Evento: {createdEventName}</p>
          <Form {...notificationForm}>
            <form onSubmit={notificationForm.handleSubmit(createNotificationSettings)} className="space-y-4">
              <FormField
                control={notificationForm.control}
                name="invitation_event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID del Evento</FormLabel>
                    <Input
                      {...field}
                      disabled={true}
                      value={createdEventId}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="campaign_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Campaña</FormLabel>
                    <Input
                      {...field}
                      placeholder="Nombre de la campaña"
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notification">Notificación</SelectItem>
                        <SelectItem value="reminder">Recordatorio</SelectItem>
                        <SelectItem value="alert">Alerta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <Input
                      {...field}
                      placeholder="Asunto del correo"
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Contenido del mensaje"
                      disabled={isSubmitting}
                      rows={6}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={notificationForm.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2 mt-4"
                  onClick={() => setShowNotificationForm(false)}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  type="submit"
                  className="w-1/2 mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Finalizando..." : "Finalizar Evento"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;