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
  templateId: z.string().min(1, "Debes seleccionar una plantilla"),
});

type FormValues = z.infer<typeof formSchema>;

const EventInvitation: React.FC<EventInvitationProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Inicializar formulario
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      templateId: "",
    },
  });

  // Cargar proyectos al montar el componente
  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

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

  // Función para obtener plantillas de notificación desde Supabase
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        //@ts-expect-error: tabla no incluida en el tipado de supabase aún
        .from('notification_settings')
        .select('id, subject, message, channel')
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
      ["nombre", "apellido", "email"],
      ["Juan", "Pérez", "juan@ejemplo.com"],
      ["María", "González", "maria@ejemplo.com"],
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
      const requiredHeaders = ["nombre", "apellido", "email"];

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

      // Procesar filas de datos
      const errors: ImportError[] = [];
      let successCount = 0;

      // Obtener la plantilla seleccionada
      const selectedTemplate = templates.find(t => t.id === values.templateId);
      if (!selectedTemplate) {
        toast.error("No se encontró la plantilla seleccionada");
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
          const apellido = row[apellidoIndex]?.toString().trim();
          const email = row[emailIndex]?.toString().trim();

          // Validar datos de la fila
          const rowErrorFieldsEmpty = [];
          const rowErrors = [];

          if (!nombre) rowErrorFieldsEmpty.push("Nombre");
          if (!apellido) rowErrorFieldsEmpty.push("Apellido");

          if (!email) {
            rowErrorFieldsEmpty.push("Email");
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            rowErrors.push("Formato de email inválido");
          }

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
              try {
                invitation = await createInvitation({
                  project_id: form.getValues().projectId,
                  email: email,
                  first_name: nombre,
                  last_name: apellido,
                  invitation_type: "new_user",
                  fb_step_completed: false,
                  status: "pending"
                });
                
                console.log(`Usuario creado exitosamente: ${email}`, invitation);
                processedInvitations.push(invitation);
                
                // Añadir a la lista de destinatarios para enviar correo
                recipients.push({
                  email: email,
                  name: `${nombre} ${apellido}`,
                  variables: {
                    name: `${nombre} ${apellido}`,
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}`
                  }
                });
                
                successCount++;
              } catch (error) {
                console.error(`Error al crear usuario: ${email}`, error);
                throw new Error(`No se pudo crear el usuario: ${error.message}`);
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
                    invitationUrl: `${window.location.origin}${invitation.invitation_url}`
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
          let htmlContent = selectedTemplate.message;
          // Reemplazar las variables en el formato de Mailjet
          htmlContent = htmlContent.replace(/\{\{full_name\}\}/g, "{{var:name}}");
          htmlContent = htmlContent.replace(/\{\{url\}\}/g, "{{var:invitationUrl}}");
          
          const { data: response, error } = await supabase.functions.invoke('mailjet-campaign', {
            body: {
              htmlContent: htmlContent,
              recipients: recipients,
              subject: selectedTemplate.subject || "Invitación a Evento",
              customCampaign: "event_invitation"
            }
          });
          
          if (error) throw error;
          
          // Extraer campaign_id de la respuesta de Mailjet
          const campaignId = response?.campaignId || null;
          if (campaignId) {
            // 1. Insertar en invitation_events
            const { data: invitationEvent, error: invitationEventError } = await supabase
              .from('invitation_events')
              .insert({
                id_project: form.getValues().projectId,  // Cambiado de project_id a id_project
                campaign_id: campaignId,
                campaign_name: "event_invitation" // Valor de customCampaign
              })
              .select()
              .single();
            
            if (invitationEventError) {
              console.error("Error al crear invitation_events:", invitationEventError);
              throw invitationEventError;
            }
            
            // 2. Insertar en creator_invitation_events para cada invitación procesada
            if (invitationEvent && processedInvitations.length > 0) {
              const creatorInvitationEvents = processedInvitations.map(invitation => ({
                creator_invitation_id: invitation.id,  
                invitation_event_id: invitationEvent.id,  
                // sending_date se establecerá por defecto en la base de datos
              }));
              
              // Actualizar registration_event_id en creator_invitations
              const { error: updateError } = await supabase
                .from('creator_invitations')
                .update({ registration_event_id: invitationEvent.id })
                .in('id', processedInvitations.map(inv => inv.id));

              if (updateError) {
                console.error("Error al actualizar registration_event_id:", updateError);
                throw updateError;
              }
              
              const { error: creatorInvitationEventsError } = await supabase
                .from('creator_invitations_events')
                .insert(creatorInvitationEvents);
              
              if (creatorInvitationEventsError) {
                console.error("Error al crear creator_invitation_events:", creatorInvitationEventsError);
                throw creatorInvitationEventsError;
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
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plantilla de Invitación</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.subject || "Plantilla sin asunto"}
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
                  <strong>nombre</strong> | <strong>apellido</strong> | <strong>email</strong><br />
                  Juan | Pérez | juan@ejemplo.com
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