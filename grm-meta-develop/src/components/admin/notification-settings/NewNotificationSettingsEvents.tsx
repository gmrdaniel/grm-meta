import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewNotificationSettingsEventsProps {
  eventId: string;
  eventName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface EventDetails {
  event_name: string;
}

// Define el esquema del formulario de notificaciones
const notificationFormSchema = z.object({
  invitation_event_id: z.string(),
  campaign_name: z.string().min(1, "El nombre de la campaña es obligatorio"),
  type: z.enum(["notification", "reminder", "alert"]),
  subject: z.string().min(1, "El asunto es obligatorio"),
  message: z.string().min(1, "El mensaje es obligatorio"),
  channel: z.enum(["email", "sms"]),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export function NewNotificationSettingsEvents({ eventId, eventName, onSuccess, onCancel }: NewNotificationSettingsEventsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

  // Inicializar formulario de notificaciones
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      invitation_event_id: eventId || "",
      campaign_name: "",
      type: "notification",
      subject: "",
      message: "",
      channel: "email",
    },
  });

  // Actualizar el valor de invitation_event_id cuando cambia eventId
  useEffect(() => {
    if (eventId) {
      form.setValue("invitation_event_id", eventId);
      fetchEventDetails(eventId);
    }
  }, [eventId, form]);

  // Función para obtener detalles del evento desde Supabase
  const fetchEventDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('invitation_events')
        .select('event_name')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error al cargar detalles del evento:', error);
        return;
      }

      setEventDetails(data);
    } catch (error: any) {
      console.error('Error al cargar detalles del evento:', error);
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
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error al crear configuración de notificación:', error);
      toast.error(`Error al crear configuración de notificación: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(createNotificationSettings)}>
          <CardContent className="space-y-6 pt-6">
            <h2 className="text-xl font-bold mb-4">Configurar Notificación para el Evento</h2>
            {(eventName || eventDetails?.event_name) && (
              <p className="mb-4 text-sm text-gray-600">Evento: {eventName || eventDetails?.event_name}</p>
            )}
            
            <FormField
              control={form.control}
              name="invitation_event_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID del Evento</FormLabel>
                  <Input
                    {...field}
                    disabled={true}
                    value={eventId}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-between">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Volver
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Notificación"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}