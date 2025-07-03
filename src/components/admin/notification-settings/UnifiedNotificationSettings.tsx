import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationSetting } from "./types";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";

// Esquema unificado para todos los tipos de notificaciones
const notificationSchema = z.object({
  // Common fields
  type: z.enum(["notification", "reminder", "alert"]),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(1, "Message is required"),
  channel: z.enum(["email", "sms"]),
  enabled: z.boolean().default(true),

  // Fields for regular notifications
  delay_days: z.number().int().min(0).optional(),
  frequency_days: z.number().int().min(0).optional(),
  max_notifications: z.number().int().min(0).optional(),
  stage_id: z.string().nullable().optional(),

  // Fields for event notifications
  invitation_event_id: z.string().nullable().optional(),
  campaign_name: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface UnifiedNotificationSettingsProps {
  // Modo de edición o creación
  isEditing?: boolean;
  // Notificación existente para editar
  notificationSetting?: NotificationSetting;
  // ID del evento (opcional)
  eventId?: string;
  // Nombre del evento (opcional)
  eventName?: string;
  // Callbacks
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UnifiedNotificationSettings({
  isEditing = false,
  notificationSetting,
  eventId,
  eventName,
  onSuccess,
  onCancel,
}: UnifiedNotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDetails, setEventDetails] = useState<{
    event_name: string;
  } | null>(null);

  // Configurar valores predeterminados según si estamos editando
  const defaultValues =
    isEditing && notificationSetting
      ? {
          // Valores para edición
          type: notificationSetting.type,
          subject: notificationSetting.subject || "",
          message: notificationSetting.message,
          channel: notificationSetting.channel,
          enabled: notificationSetting.enabled,
          delay_days: notificationSetting.delay_days || 0,
          frequency_days: notificationSetting.frequency_days || 0,
          max_notifications: notificationSetting.max_notifications || 0,
          stage_id: notificationSetting.stage_id,
          invitation_event_id: notificationSetting.invitation_event_id || null,
          campaign_name: notificationSetting.campaign_name || "",
        }
      : {
          // Valores predeterminados para creación
          type: "notification",
          subject: "",
          message: "",
          channel: "email",
          enabled: true,
          delay_days: 0,
          frequency_days: 0,
          max_notifications: 0,
          stage_id: null,
          invitation_event_id: eventId || null,
          campaign_name: "",
        };

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues,
  });

  // Función para obtener etapas del proyecto
  const fetchProjectStages = async () => {
    const { data, error } = await supabase
      .from("project_stages")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Error fetching project stages: ${error.message}`);
    }

    return data || [];
  };

  // Cargar etapas del proyecto
  const { data: projectStages, isLoading: loadingStages } = useQuery({
    queryKey: ["project-stages"],
    queryFn: fetchProjectStages,

  });
  useEffect(() => {
  if (projectStages) {
    console.log("Project Stages:", projectStages);
  }
}, [projectStages]);
  // Función para obtener eventos de invitación
  const fetchInvitationEvents = async () => {
    const { data, error } = await supabase
      .from("invitation_events")
      .select("id, event_name")
      .order("event_name", { ascending: true });

    if (error) {
      throw new Error(`Error fetching invitation events: ${error.message}`);
    }

    return data || [];
  };
  
  // Cargar eventos de invitación
  const { data: invitationEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ["invitation-events"],
    queryFn: fetchInvitationEvents,
  });

  // Cargar detalles del evento si tenemos un ID
  useEffect(() => {
    if (eventId && !eventName) {
      fetchEventDetails(eventId);
    }
  }, [eventId, eventName]);

  // Función para obtener detalles del evento
  const fetchEventDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("invitation_events")
        .select("event_name")
        .eq("id", id)
        .single();

      if (error) throw error;
      setEventDetails(data);
    } catch (error) {
      console.error("Error al cargar detalles del evento:", error);
    }
  };

  // Función para enviar el formulario
  const onSubmit = async (values: NotificationFormValues) => {
    setIsSubmitting(true);
    try {
      // Preparar los datos para enviar
      const dataToSubmit = {
        type: values.type,
        subject: values.subject,
        message: values.message,
        channel: values.channel,
        enabled: values.enabled,
        delay_days: values.delay_days,
        frequency_days: values.frequency_days,
        max_notifications: values.max_notifications,
        stage_id: values.stage_id === "none" ? null : values.stage_id,
        invitation_event_id:
          values.invitation_event_id === "none"
            ? null
            : values.invitation_event_id,
        campaign_name: values.campaign_name,
      };

      if (isEditing && notificationSetting) {
        // Actualizar notificación existente
        const { error } = await supabase
          .from("notification_settings")
          .update(dataToSubmit)
          .eq("id", notificationSetting.id);

        if (error) throw error;

        toast.success("Notification updated successfully");
      } else {
        // Crear nueva notificación
        const { error } = await supabase
          .from("notification_settings")
          .insert([dataToSubmit]);

        if (error) throw error;

        toast.success("Notification created successfully");
        form.reset();
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(
        `Error while ${isEditing ? "update" : "create"} notification: ${
          err.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      {isEditing && (
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Edit Notification Settings</h3>
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            {!isEditing && (
              <h2 className="text-xl font-bold mb-4">Configure Notification</h2>
            )}

            {eventName || eventDetails?.event_name ? (
              <p className="mb-4 text-sm text-gray-600">
                Pre-selected event: {eventName || eventDetails?.event_name}
              </p>
            ) : null}

            {/* Sección de información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="notification">
                          Notification
                        </SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The category of the notification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />{" "}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Subject of the notification"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Message content"
                      disabled={isSubmitting}
                      rows={6}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sección de configuración de etapas y eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="stage_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Stage</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                      disabled={isSubmitting || loadingStages}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (All stages)</SelectItem>
                        {projectStages?.map(
                          (stage: { id: string; name: string }) => (
                            <SelectItem key={stage.id} value={stage.id}>
                              {stage.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Project stage to which this notification applies{" "}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invitation_event_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invitation Event</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                      disabled={isSubmitting || loadingEvents}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {invitationEvents?.map(
                          (event: { id: string; event_name: string }) => (
                            <SelectItem key={event.id} value={event.id}>
                              {event.event_name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Invitation event associated with this notification{" "}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="campaign_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Name to identify this notification"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Campaign name (for event notifications only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sección de configuración de tiempos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="delay_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days of Delay</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Days after the event to send
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency (Days)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Repetition frequency in days
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_notifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Notifications</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of notifications to send
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enabled</FormLabel>
                    <FormDescription>
                      Turn this notification on or off
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
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
                Cancel{" "}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Save Notification"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
