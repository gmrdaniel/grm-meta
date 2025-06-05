import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
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
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { createInvitation } from "@/services/invitation/createInvitation";
import { sendEmail } from "@/services/email/sendIEmail";
import { CreateInvitationData } from "@/types/invitation";

interface EventInvitationProps {
  onSuccess?: () => void;
}

interface ImportError {
  row: number;
  data: {
    nombre: string;
    apellido: string;
    email: string;
  };
  error: string;
}

// Define el esquema del formulario
const formSchema = z.object({
  projectId: z.string().min(1, "Debes seleccionar un proyecto"),
  eventId: z.string().min(1, "Debes seleccionar un evento"),
  notificationId: z.string().min(1, "Debes seleccionar una notificación")
});

type FormValues = z.infer<typeof formSchema>;

const EventInvitation: React.FC<EventInvitationProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [invitationEvents, setInvitationEvents] = useState<any[]>([]);
  const [selectedEventNotifications, setSelectedEventNotifications] = useState<any[]>([]);
  // Inicializar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      eventId: "",
      notificationId: ""
    },
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Añadir un nuevo useEffect para escuchar cambios en projectId
  useEffect(() => {
    const projectId = form.watch('projectId');
    if (projectId) {
      fetchInvitationEvents(projectId);
    }
  }, [form.watch('projectId')]);

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

  const fetchInvitationEvents = async (projectId?: string) => {
    try {
      const query = supabase
        .from('invitation_events')
        .select('id, event_name')

      // Si hay un projectId, filtrar por ese proyecto
      if (projectId) {
        query.eq('id_project', projectId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Error al cargar los eventos');
        console.error(error);
        return;
      }

      setInvitationEvents(data || []);
      // Limpiar la selección de evento y notificación cuando cambia el proyecto
      form.setValue('eventId', '');
      form.setValue('notificationId', '');
      setSelectedEventNotifications([]);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
      toast.error('Error al cargar los eventos');
    }
  };

  const fetchEventNotifications = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('id, type, subject,message,campaign_id,campaign_name')
        .eq('invitation_event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar las notificaciones del evento');
        console.error(error);
        return;
      }

      setSelectedEventNotifications(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      toast.error('Error al cargar las notificaciones del evento');
    }
  };
  // Función para obtener plantillas de notificación desde Supabase
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        //@ts-expect-error: tabla no incluida en el tipado de supabase aún
        .from('notification_settings')
        .select('id, subject, message, channel,campaign_id, campaign_name')
        .eq('channel', 'email')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Error al cargar las plantillas');
        console.error(error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
      toast.error('Error al cargar las plantillas');
    }
  };

  // Función para descargar la plantilla de Excel
  const handleDownloadTemplate = () => {
    // Crear datos de plantilla con encabezados y fila de ejemplo
    const templateData = [
      ["nombre", "apellido", "email", "social media handle", "social media platform"],
      ["Juan", "Pérez", "juan@ejemplo.com", "juanpe", "tiktok"],
      ["María", "González", "maria@ejemplo.com", "mariig", "tiktok"],
    ];

    // Crear nuevo libro y hoja de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Añadir hoja de trabajo al libro
    XLSX.utils.book_append_sheet(wb, ws, "Invitaciones");

    // Escribir y descargar el archivo
    XLSX.writeFile(wb, "plantilla_invitaciones_evento.xlsx");

    toast.success("Plantilla descargada exitosamente");
  };

  // Función para verificar si un usuario existe en creator_invitations
  const checkUserExistsAndStatus = async (email: string) => {
    // Verificamos directamente en creator_invitations
    const { data: invitationData, error: invitationError } = await supabase
      .from('creator_invitations')
      .select('status')
      .eq('email', email)
      .eq('project_id', form.getValues().projectId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (invitationError) {
      console.error('Error al verificar invitación:', invitationError);
      return { exists: false, status: null };
    }

    return {
      exists: !!invitationData,
      status: invitationData?.status || null
    };
  };

  // Función para crear un usuario en Supabase si no existe
  const createUserIfNotExists = async (email: string, firstName: string, lastName: string) => {
    const { exists, status } = await checkUserExistsAndStatus(email);

    // Si el usuario no existe, lo creamos
    if (!exists) {
      try {
        // Crear la invitación para el nuevo usuario
        const invitation = await createInvitation({
          project_id: form.getValues().projectId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          invitation_type: "new_user",
          fb_step_completed: false,
          status: "pending"
        });

        console.log(`Usuario creado exitosamente: ${email}`, invitation);
        return { created: true, status: "pending", invitation };
      } catch (error) {
        console.error(`Error al crear usuario: ${email}`, error);
        throw new Error(`No se pudo crear el usuario: ${error.message}`);
      }
    }

    return { created: false, status, invitation: null };
  };

  // Función principal para manejar la importación
  const handleImport = async (values: FormValues) => {
    if (!file) {
      toast.error("Por favor selecciona un archivo para importar");
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    setImportSuccess(0);

    try {
      // Leer el archivo Excel
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

      // Validar encabezados
      const headers = jsonData[0];
      const requiredHeaders = ["nombre", "apellido", "email", "social media handle", "social media platform"];

      // Verificar que todos los encabezados requeridos estén presentes
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(", ")}`);
        setIsImporting(false);
        return;
      }

      // Obtener índices de columnas
      const nombreIndex = headers.indexOf("nombre");
      const apellidoIndex = headers.indexOf("apellido");
      const emailIndex = headers.indexOf("email");
      const socialHandleIndex = headers.indexOf("social media handle")
      const socialPlatformIndex = headers.indexOf("social media platform")

      // Procesar filas de datos
      const errors: ImportError[] = [];
      let successCount = 0;

      // Obtener la notificación seleccionada
      const selectedNotification = selectedEventNotifications.find(n => n.id === values.notificationId);
      console.log("check the invitation ", selectedNotification, selectedNotification.id)

      if (!selectedNotification) {
        toast.error("No se encontró la notificación seleccionada");
        setIsImporting(false);
        return;
      }

      // Array para almacenar los destinatarios que recibirán correo (status pending)
      const recipients = [];
      const processedInvitations = [];

      // Procesar cada fila de datos
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNumber = i + 1;

        // Omitir filas vacías
        if (!(!row || row.length === 0)) {
          const nombre = row[nombreIndex]?.toString().trim();
          const apellido = row[apellidoIndex]?.toString().trim() || "";
          let email = row[emailIndex]?.toString().trim();
          email = email?.toLowerCase()
          const socialHandle = row[socialHandleIndex]?.toString().trim()
          const socialPlatform = row[socialPlatformIndex]?.toString().trim()

          // Validar datos de la fila
          const rowErrorFieldsEmpty = [];
          const rowErrors = [];

          if (!nombre) rowErrorFieldsEmpty.push("Usuario");

          if (!email) {
            rowErrorFieldsEmpty.push("Email");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            rowErrors.push("Formato de email inválido");
          }

          if (!socialHandle) rowErrorFieldsEmpty.push("Social Handle")
          if (!socialPlatform) rowErrorFieldsEmpty.push("Social Platform")

          if (rowErrorFieldsEmpty.length > 0) {
            rowErrors.push(`Debes indicar los campos requeridos (${rowErrorFieldsEmpty.join(',')})`);
          }

          // Si hay errores, registrarlos y continuar con la siguiente fila
          if (rowErrors.length > 0) {
            errors.push({
              row: rowNumber,
              data: {
                nombre: nombre ?? "",
                apellido: apellido || "",
                email: email || "",
              },
              error: rowErrors.join(", "),
            });
            continue;
          }

          try {
            // Verificar si el usuario existe y su estado
            const { exists, status } = await checkUserExistsAndStatus(email);

            let invitation;

            // Si el usuario ya existe pero no tiene una invitación para este evento, creamos una
            if (!exists && status !== "pending") {


              // Prepare invitation data dynamically
              const invitationData: CreateInvitationData = {
                project_id: form.getValues().projectId,
                email: email.toLowerCase(),
                first_name: nombre,
                last_name: apellido,
                invitation_type: "new_user",
                fb_step_completed: false,
                status: "pending",
                social_media_type: socialPlatform
              };

              // Set handle field based on platform
              switch (socialPlatform.toUpperCase()) {
                case "TIKTOK":
                  invitationData.social_media_handle = socialHandle || null;
                  break;
                case "YOUTUBE":
                  invitationData.youtube_channel = socialHandle || null;
                  break;
                case "INSTAGRAM":
                  invitationData.instagram_user = socialHandle || null;
                  break;
                default:
                  rowErrors.push(`Imports for this social media (${socialPlatform}) are not allowed.`)
                  break;
              }


              try {
                invitation = await createInvitation(invitationData);

                console.log(`Usuario creado exitosamente: ${email}`, invitation);
                processedInvitations.push(invitation);

                // Añadir a la lista de destinatarios para enviar correo
                recipients.push({
                  email: email,
                  name: `${nombre} ${apellido}`,
                  variables: {
                    name: `${nombre} ${apellido}`,
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}?notif=${selectedNotification.id}`
                  }
                });

                successCount++;
              } catch (error) {
                console.error(`Error al crear usuario: ${email}`, error);
                throw new Error(`No se pudo crear la invitación: ${error.message}`);
              }
            }
            // Si existe y su estado es pending, enviamos correo
            else if (status === "pending") {
              try {
                // En lugar de crear una nueva invitación, obtenemos la existente
                const { data: existingInvitation, error: fetchError } = await supabase
                  .from('creator_invitations')
                  .select('*')
                  .eq('email', email)
                  .eq('project_id', values.projectId)
                  .eq('status', 'pending')
                  .order('created_at', { ascending: false })
                  .maybeSingle();

                if (fetchError) {
                  throw new Error(`Error al obtener la invitación existente: ${fetchError.message}`);
                }

                if (!existingInvitation) {
                  throw new Error(`No se encontró una invitación pendiente para ${email}`);
                }

                // Usar la invitación existente
                invitation = existingInvitation;
                processedInvitations.push(invitation);

                // Añadir a la lista de destinatarios para enviar correo
                recipients.push({
                  email: email,
                  name: `${nombre} ${apellido}`,
                  variables: {
                    name: `${nombre} ${apellido}`,
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}?notif=${selectedNotification.id}`
                  }
                });

                successCount++;
                console.log(`Usando invitación existente para ${email}:`, invitation);
              } catch (error) {
                console.error("Error al procesar invitación existente:", error);
                throw new Error(`No se pudo procesar la invitación: ${error.message}`);
              }
            } else {
              console.log(`Usuario ${email} omitido porque su estado no es pending: ${status}`);
            }
          } catch (error) {
            console.error("Error al procesar invitación:", error);
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            errors.push({
              row: rowNumber,
              data: {
                nombre: nombre ?? "",
                apellido: apellido || "",
                email: email || "",
              },
              error: errorMessage,
            });
          }
        }
      }

      // Si hay destinatarios, enviar correos usando mailjet-campaign
      if (recipients.length > 0) {
        try {
          // Preparar el contenido HTML con variables de Mailjet
          let htmlContent = selectedNotification.message;
          // Reemplazar las variables en el formato de Mailjet
          htmlContent = htmlContent.replace(/\{\{full_name\}\}/g, "{{var:name}}");
          htmlContent = htmlContent.replace(/\{\{url\}\}/g, "{{var:invitationUrl}}");

          // Obtener el evento seleccionado
          const selectedEvent = invitationEvents.find(e => e.id === values.eventId);
          if (!selectedEvent) {
            toast.error("No se encontró el evento seleccionado");
            setIsImporting(false);
            return;
          }

          const { data: response, error } = await supabase.functions.invoke('mailjet-campaign', {
            body: {
              htmlContent: htmlContent,
              recipients: recipients,
              subject: selectedNotification.subject || "Invitación a Evento",
              customCampaign: selectedNotification.campaign_name
            }
          });

          if (error) throw error;

          // Extraer campaign_id de la respuesta de Mailjet
          const campaignId = response?.campaignId || null;
          if (campaignId) {
            // Actualizar campaign_id en notification_settings
            const { error: updateError } = await supabase
              .from('notification_settings')
              .update({ campaign_id: campaignId })
              .eq('campaign_name', selectedNotification.campaign_name);

            if (updateError) {
              console.error("Error al actualizar campaign_id en notification_settings:", updateError);
              throw updateError;
            }
            if (processedInvitations.length > 0) {
              const creatorInvitationEvents = processedInvitations.map(invitation => ({
                creator_invitation_id: invitation.id,
                invitation_event_id: selectedEvent.id  // Usar selectedEvent.id en lugar de selectedEvent
              }));

              const { error: creatorInvitationEventsError } = await supabase
                .from('creator_invitations_events')
                .insert(creatorInvitationEvents);

              if (creatorInvitationEventsError) {
                console.error("Error al crear creator_invitation_events:", creatorInvitationEventsError);
                if (creatorInvitationEventsError?.code != '23505') {//Si el error es diferente a duplicados en bd
                  throw creatorInvitationEventsError;
                }

              }
            }
          }

          toast.success(`Invitaciones enviadas exitosamente a ${successCount} destinatarios`);
        } catch (error) {
          console.error("Error al enviar correos:", error);
          toast.error(`Error al enviar correos: ${error.message}`);
        }
      } else {
        toast.info("No hay destinatarios con estado 'pending' para enviar correos");
      }

      setImportSuccess(successCount);
      setImportErrors(errors);
      onSuccess?.();

    } catch (error) {
      console.error("Error en la importación:", error);
      toast.error(`Error en la importación: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleImport)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seleccionar Proyecto</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting}
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seleccionar Evento</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    fetchEventNotifications(value);
                    form.setValue('notificationId', ''); // Resetear la notificación seleccionada
                  }}
                  defaultValue={field.value}
                  disabled={isImporting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {invitationEvents?.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {`${event.event_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notificationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seleccionar Notificación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting || !form.getValues().eventId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una notificación" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedEventNotifications?.map((notification) => (
                      <SelectItem key={notification.id} value={notification.id}>
                        {`Campaign: ${notification.campaign_name} - ${notification.type} - ${notification.subject}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <AlertDescription>
                  Estructura del archivo Excel para importación:<br />
                  <strong>nombre</strong> | <strong>apellido</strong> | <strong>email</strong> | <strong>social media handle</strong> | <strong>social media platform</strong><br />
                  Juan | Pérez | juan@ejemplo.com | usertiktok | tiktok
                </AlertDescription>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadTemplate}
                className="w-full sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar Plantilla
              </Button>
            </div>

            <FileUploader
              file={file}
              onFileSelect={setFile}
              accept=".xlsx,.xls"
              label="Arrastra y suelta tu archivo Excel aquí"
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={!file || isImporting}
            >
              {isImporting ? "Procesando..." : "Enviar Invitaciones"}
            </Button>
          </div>
        </form>
      </Form>

      {importErrors.length > 0 && (
        <div className="mt-6 p-4 border rounded-md bg-red-50">
          <h3 className="font-medium text-red-800 mb-2">Errores de importación ({importErrors.length})</h3>
          <ul className="space-y-2">
            {importErrors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                Fila {error.row}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {importSuccess > 0 && (
        <div className="mt-6 p-4 border rounded-md bg-green-50">
          <h3 className="font-medium text-green-800">Invitaciones enviadas exitosamente: {importSuccess}</h3>
        </div>
      )}
    </div>
  );
};

export default EventInvitation;
