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
  projectId: z.string().min(1, "You must select a project"),
  eventId: z.string().min(1, "You must select an event"),
  notificationId: z.string().min(1, "You must select a notification"),
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
  const [selectedEventNotifications, setSelectedEventNotifications] = useState<
    any[]
  >([]);
  // Inicializar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      eventId: "",
      notificationId: "",
    },
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
  }, []);

  // Añadir un nuevo useEffect para escuchar cambios en projectId
  useEffect(() => {
    const projectId = form.watch("projectId");
    if (projectId) {
      fetchInvitationEvents(projectId);
    }
  }, [form.watch("projectId")]);

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

  const fetchInvitationEvents = async (projectId?: string) => {
    try {
      const query = supabase.from("invitation_events").select("id, event_name");

      // Si hay un projectId, filtrar por ese proyecto
      if (projectId) {
        query.eq("id_project", projectId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Error loading events");
        console.error(error);
        return;
      }

      setInvitationEvents(data || []);
      // Limpiar la selección de evento y notificación cuando cambia el proyecto
      form.setValue("eventId", "");
      form.setValue("notificationId", "");
      setSelectedEventNotifications([]);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Error loading events");
    }
  };

  const fetchEventNotifications = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("id, type, subject,message,campaign_id,campaign_name")
        .eq("invitation_event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error loading event notifications");
        console.error(error);
        return;
      }

      setSelectedEventNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
      toast.error("Error loading event notifications");
    }
  };
  // Función para obtener plantillas de notificación desde Supabase
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        //@ts-expect-error: tabla no incluida en el tipado de supabase aún
        .from("notification_settings")
        .select("id, subject, message, channel,campaign_id, campaign_name")
        .eq("channel", "email")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Error loading templates");
        console.error(error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Error loading templates");
    }
  };

  // Función para descargar la plantilla de Excel
  const handleDownloadTemplate = () => {
    // Crear datos de plantilla con encabezados y fila de ejemplo
    const templateData = [
      [
        "nombre",
        "apellido",
        "email",
        "social media handle",
        "social media platform",
      ],
      ["Juan", "Pérez", "juan@ejemplo.com", "juanpe", "tiktok"],
      ["María", "González", "maria@ejemplo.com", "mariig", "tiktok"],
    ];

    // Crear nuevo libro y hoja de trabajo
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Añadir hoja de trabajo al libro
    XLSX.utils.book_append_sheet(wb, ws, "Invitations");

    // Escribir y descargar el archivo
   XLSX.writeFile(wb, "event_invitation_template.xlsx");

    toast.success("Template downloaded successfully");
  };

  // Función para verificar si un usuario existe en creator_invitations
  const checkUserExistsAndStatus = async (email: string) => {
    // Verificamos directamente en creator_invitations
    const { data: invitationData, error: invitationError } = await supabase
      .from("creator_invitations")
      .select("status")
      .eq("email", email)
      .eq("project_id", form.getValues().projectId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (invitationError) {
      console.error("Error verifying invitation:", invitationError);
      return { exists: false, status: null };
    }

    return {
      exists: !!invitationData,
      status: invitationData?.status || null,
    };
  };

  // Función para crear un usuario en Supabase si no existe
  const createUserIfNotExists = async (
    email: string,
    firstName: string,
    lastName: string
  ) => {
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
          status: "pending",
        });

        console.log(`Usuario creado exitosamente: ${email}`, invitation);
        return { created: true, status: "pending", invitation };
      } catch (error) {
        console.error(`Error creating user: ${email}`, error);
        throw new Error(`Failed to create user: ${error.message}`);
      }
    }

    return { created: false, status, invitation: null };
  };

  const chunkArray = (array: any[], chunkSize: number) => {
    const result: any[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  // Función principal para manejar la importación
  const handleImport = async (values: FormValues) => {
    if (!file) {
      toast.error("Please select a file to import");
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
      const requiredHeaders = [
        "nombre",
        "apellido",
        "email",
        "social media handle",
        "social media platform",
      ];

      // Verificar que todos los encabezados requeridos estén presentes
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );

      if (missingHeaders.length > 0) {
        toast.error(
          `Required headers are missing: ${missingHeaders.join(", ")}`
        );
        setIsImporting(false);
        return;
      }

      // Obtener índices de columnas
      const nombreIndex = headers.indexOf("nombre");
      const apellidoIndex = headers.indexOf("apellido");
      const emailIndex = headers.indexOf("email");
      const socialHandleIndex = headers.indexOf("social media handle");
      const socialPlatformIndex = headers.indexOf("social media platform");

      // Procesar filas de datos
      const errors: ImportError[] = [];
      let successCount = 0;

      // Obtener la notificación seleccionada
      const selectedNotification = selectedEventNotifications.find(
        (n) => n.id === values.notificationId
      );
      console.log(
        "check the invitation ",
        selectedNotification,
        selectedNotification.id
      );

      if (!selectedNotification) {
        toast.error("The selected notification was not found");
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
          email = email?.toLowerCase();
          const socialHandle = row[socialHandleIndex]?.toString().trim();
          const socialPlatform = row[socialPlatformIndex]?.toString().trim();

          // Validar datos de la fila
          const rowErrorFieldsEmpty = [];
          const rowErrors = [];

          if (!nombre) rowErrorFieldsEmpty.push("Usuario");

          if (!email) {
            rowErrorFieldsEmpty.push("Email");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            rowErrors.push("Invalid email format");
          }

          if (!socialHandle) rowErrorFieldsEmpty.push("Social Handle");
          if (!socialPlatform) rowErrorFieldsEmpty.push("Social Platform");

          if (rowErrorFieldsEmpty.length > 0) {
            rowErrors.push(
              `You must specify required fields (${rowErrorFieldsEmpty.join(
                ","
              )})`
            );
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
                social_media_type: socialPlatform,
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
                  rowErrors.push(
                    `Imports for this social media (${socialPlatform}) are not allowed.`
                  );
                  break;
              }

              try {
                invitation = await createInvitation(invitationData);

                console.log(`User created successfully: ${email}`, invitation);
                processedInvitations.push(invitation);

                // Añadir a la lista de destinatarios para enviar correo
                recipients.push({
                  email: email,
                  name: `${nombre} ${apellido}`,
                  variables: {
                    name: `${nombre} ${apellido}`,
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}?notif=${selectedNotification.id}`,
                  },
                });

                successCount++;
              } catch (error) {
                console.error(`Error creating user: ${email}`, error);
                throw new Error(
                  `Failed to create invitation: ${error.message}`
                );
              }
            }
            // Si existe y su estado es pending, enviamos correo
            else if (status === "pending") {
              try {
                // En lugar de crear una nueva invitación, obtenemos la existente
                const { data: existingInvitation, error: fetchError } =
                  await supabase
                    .from("creator_invitations")
                    .select("*")
                    .eq("email", email)
                    .eq("project_id", values.projectId)
                    .eq("status", "pending")
                    .order("created_at", { ascending: false })
                    .maybeSingle();

                if (fetchError) {
                  throw new Error(
                    `Error getting existing invitation: ${fetchError.message}`
                  );
                }

                if (!existingInvitation) {
                  throw new Error(`No pending invitation found for ${email}`);
                }

                // Usar la invitación existente
                invitation = existingInvitation;

                // Actualizar campos de redes sociales si están vacíos en la invitación existente
                let needsUpdate = false;
                const updateData: Partial<CreateInvitationData> = {};

                // Verificar y actualizar campos de redes sociales según la plataforma
                if (socialPlatform && socialHandle) {
                  switch (socialPlatform.toUpperCase()) {
                    case "TIKTOK":
                      if (!invitation.social_media_handle && socialHandle) {
                        updateData.social_media_handle = socialHandle;
                        needsUpdate = true;
                      }
                      break;
                    case "YOUTUBE":
                      if (!invitation.youtube_channel && socialHandle) {
                        updateData.youtube_channel = socialHandle;
                        needsUpdate = true;
                      }
                      break;
                    case "INSTAGRAM":
                      if (!invitation.instagram_user && socialHandle) {
                        updateData.instagram_user = socialHandle;
                        needsUpdate = true;
                      }
                      break;
                  }
                }

                // Si hay campos para actualizar, hacemos la actualización
                if (needsUpdate) {
                  const { error: updateError } = await supabase
                    .from("creator_invitations")
                    .update(updateData)
                    .eq("id", invitation.id);

                  if (updateError) {
                    console.warn(
                      `Social network data could not be updated: ${updateError.message}`
                    );
                  } else {
                    console.log(
                      `Social network data updated for ${email}:`,
                      updateData
                    );
                  }
                }

                processedInvitations.push(invitation);

                // Añadir a la lista de destinatarios para enviar correo
                recipients.push({
                  email: email,
                  name: `${nombre} ${apellido}`,
                  variables: {
                    name: `${nombre} ${apellido}`,
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}?notif=${selectedNotification.id}`,
                  },
                });

                successCount++;
                console.log(
                  `Using existing invitation for ${email}:`,
                  invitation
                );
              } catch (error) {
                console.error("Error al procesar invitación existente:", error);
                throw new Error(
                  `The invitation could not be processed: ${error.message}`
                );
              }
            } else {
              console.log(
                `Usuario ${email} omitido porque su estado no es pending: ${status}`
              );
            }
          } catch (error) {
            console.error("Error al procesar invitación:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
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
          htmlContent = htmlContent.replace(
            /\{\{full_name\}\}/g,
            "{{var:name}}"
          );
          htmlContent = htmlContent.replace(
            /\{\{url\}\}/g,
            "{{var:invitationUrl}}"
          );

          // Obtener el evento seleccionado
          const selectedEvent = invitationEvents.find(
            (e) => e.id === values.eventId
          );
          if (!selectedEvent) {
            toast.error("The selected event was not found");
            setIsImporting(false);
            return;
          }

          const { data: response, error } = await supabase.functions.invoke(
            "mailjet-campaign",
            {
              body: {
                htmlContent: htmlContent,
                recipients: recipients,
                subject: selectedNotification.subject || "Event Invitation",
                customCampaign: selectedNotification.campaign_name,
              },
            }
          );

          if (error) throw error;

          // Extraer campaign_id de la respuesta de Mailjet
          const campaignId = response?.campaignId || null;
          if (!campaignId) {
            console.log(campaignId);
            console.log("No hay nada");
          }

          if (campaignId) {
            // Actualizar campaign_id en notification_settings
            const { error: updateError } = await supabase
              .from("notification_settings")
              .update({ campaign_id: campaignId })
              .eq("campaign_name", selectedNotification.campaign_name);

            if (updateError) {
              console.error(
                "Error updating campaign_id in notification_settings:",
                updateError
              );
              throw updateError;
            }

            if (processedInvitations.length > 0) {
              const creatorInvitationEvents = processedInvitations.map(
                (invitation) => ({
                  creator_invitation_id: invitation.id,
                  invitation_event_id: selectedEvent.id,
                })
              );

              const { error: creatorInvitationEventsError } = await supabase
                .from("creator_invitations_events")
                .insert(creatorInvitationEvents);

              if (creatorInvitationEventsError) {
                console.error(
                  "Error al crear creator_invitation_events:",
                  creatorInvitationEventsError
                );
                if (creatorInvitationEventsError?.code != "23505") {
                  //Si el error es diferente a duplicados en bd
                  throw creatorInvitationEventsError;
                }
              }

              console.log(
                `Registrando ${processedInvitations.length} logs de notificación...`
              );

              const logPromises = processedInvitations.map((invitation) => {
                return supabase.from("notification_logs").insert({
                  channel: "email",
                  status: "sent",
                  invitation_id: invitation.id,
                  notification_setting_id: selectedNotification.id,
                  campaign_id: campaignId,
                  campaign_name: selectedNotification.campaign_name,
                });
              });

              const logResults = await Promise.allSettled(logPromises);

              // Procesar resultados de los inserts
              const logsSuccessCount = logResults.filter(
                (result) =>
                  result.status === "fulfilled" && !(result.value as any).error
              ).length;

              console.log(
                `✅ ${logsSuccessCount} de ${processedInvitations.length} logs registrados correctamente`
              );

              // Registrar errores si los hay
              logResults.forEach((result, index) => {
                if (
                  result.status === "rejected" ||
                  (result.status === "fulfilled" && (result.value as any).error)
                ) {
                  const error =
                    result.status === "rejected"
                      ? (result as PromiseRejectedResult).reason
                      : (result as PromiseFulfilledResult<any>).value.error;

                  console.error(
                    `Error al registrar log para la invitación ${processedInvitations[index].id}:`,
                    error
                  );
                }
              });
            }
          }

          toast.success(
            `Invitations successfully sent to ${successCount} recipients`
          );
        } catch (error) {
          console.error("Error al enviar correos:", error);
          toast.error(`Error al enviar correos: ${error.message}`);
        }
      } else {
        toast.info(
          "There are no recipients with a 'pending' status for sending emails"
        );
      }

      setImportSuccess(successCount);
      setImportErrors(errors);
      onSuccess?.();
    } catch (error) {
      console.error("Error en la importación:", error);
      toast.error(`Import error: ${error.message}`);
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
                <FormLabel>Select Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting}
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
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Event</FormLabel>{" "}
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    fetchEventNotifications(value);
                    form.setValue("notificationId", ""); // Resetear la notificación seleccionada
                  }}
                  defaultValue={field.value}
                  disabled={isImporting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an event" />
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
                <FormLabel>Select Notification</FormLabel>{" "}
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting || !form.getValues().eventId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a notification" />{" "}
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
                  Structure of the Excel file for import:
                  <br />
                  <strong>name</strong> | <strong>last name</strong> |{" "}
                  <strong>email</strong> | <strong>social media handle</strong>{" "}
                  | <strong>social media platform</strong>
                  <br />
                  John | Perez | juan@example.com | usertiktok | tiktok
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
Download Template              </Button>
            </div>

            <FileUploader
              file={file}
              onFileSelect={setFile}
              accept=".xlsx,.xls"
     label="Drag and drop your Excel file here"
            />

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={!file || isImporting}
            >
            {isImporting ? "Processing..." : "Send Invitations"}
            </Button>
          </div>
        </form>
      </Form>

      {importErrors.length > 0 && (
        <div className="mt-6 p-4 border rounded-md bg-red-50">
          <h3 className="font-medium text-red-800 mb-2">
            Errores de importación ({importErrors.length})
          </h3>
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
          <h3 className="font-medium text-green-800">
            Invitaciones enviadas exitosamente: {importSuccess}
          </h3>
        </div>
      )}
    </div>
  );
};

export default EventInvitation;
