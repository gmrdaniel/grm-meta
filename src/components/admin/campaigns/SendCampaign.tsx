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
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Importar la función createInvitation
import { createInvitation } from '@/services/invitation/createInvitation';

interface ImportCampaignProps {
  onSuccess?: () => void;
}

interface ImportError {
  row: number;
  data: {
    email: string;
    name?: string;
    paragraph: string;
  };
  error: string;
}

const formSchema = z.object({
  channel: z.enum(["email", "instagram", "whatsapp", "telegram"]),
  messageType: z.enum(["template", "plaintext"]),
  templateId: z.string().optional(),
  plainText: z.string().optional(),
  htmlContent: z.string().optional(),
  customCampaign: z.string().min(1, "Debes ingresar un nombre para la campaña"),
  deduplicateCampaign: z.boolean().optional(),
  subject: z.string().min(1, "Debes ingresar un asunto para el correo"),
  generateInvitations: z.boolean().default(false),
  projectId: z.string().min(1, "Debes seleccionar un proyecto")
});

type FormValues = z.infer<typeof formSchema>;

const ImportCampaign: React.FC<ImportCampaignProps> = ({ onSuccess }) => {
  const [projects, setProjects] = useState<Array<{ id: string, name: string }>>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name');

      if (error) {
        toast.error('Error al cargar los proyectos');
        return;
      }

      setProjects(data || []);
    };

    fetchProjects();
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel: "email",
      messageType: "template",
      templateId: "",
      plainText: "",
      htmlContent: "",
      subject: "",
      generateInvitations: false,
      projectId: null
    },
  });

  const messageType = form.watch("messageType");
  const channel = form.watch("channel");

  const handleDownloadTemplate = () => {
    const template = [
      ["Email", "Name", "Paragraph"],
      ["ejemplo@email.com", "Nombre Ejemplo", "Contenido del párrafo para el email"]
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "campaign-template.xlsx");
  };

  const handleImport = async (values: FormValues) => {
    if (!file) {
      toast.error("Por favor selecciona un archivo para importar");
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    setImportSuccess(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

      // Validate headers
      const headers = jsonData[0];
      const requiredHeaders = ["Email", "Name", "Paragraph"];

      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );
      if (missingHeaders.length > 0) {
        toast.error(`Faltan encabezados requeridos: ${missingHeaders.join(", ")}`);
        setIsImporting(false);
        return;
      }

      // Get column indices
      const emailIndex = headers.indexOf("Email");
      const nameIndex = headers.indexOf("Name");
      const paragraphIndex = headers.indexOf("Paragraph");

      // Process rows
      const rows = jsonData.slice(1).map((row: any) => ({
        email: row[emailIndex],
        name: row[nameIndex],
        paragraph: row[paragraphIndex]
      }));

      if (channel === "email") {
        // Procesar las filas y generar invitaciones si es necesario
        const processedRows = await Promise.all(rows.map(async (row) => {
          let invitationData = {};
          if (values.projectId && values.projectId !="Ninguno") {
            try {
              const invitation = await createInvitation({
                project_id: values.projectId,
                email: row.email,
                first_name: row.name.split(' ')[0] || row.email.split('@')[0],
                last_name:row.name.split(' ').slice(1).join(' ') || '',
                invitation_type:"new_user",
                social_media_type: "pinterest"
              });
              
              invitationData = {
                invitation_code: invitation.invitation_code,
                invitation_url: invitation.invitation_url
              };
            } catch (error) {
              console.error('Error generating invitation:', error);
            }
          }

          return {
            email: row.email,
            name: row.name,
            variables: {
              paragraph: row.paragraph,
              invitationCode: invitationData.invitation_code || "NO CODE", 
              invitationUrl: invitationData.invitation_url || "NO URL"
            }
          };
        }));

        const { data: response, error } = await supabase.functions.invoke('mailjet-campaign', {
          body: {
            templateId: values.messageType === 'template' ? values.templateId : undefined,
            textContent: values.messageType === 'plaintext' ? values.plainText : undefined,
            htmlContent: values.htmlContent,
            recipients: processedRows,
            subject: values.subject,
            customCampaign: values.customCampaign,
            //deduplicateCampaign: values.deduplicateCampaign
          }
        });
        console.log(processedRows)
        if (error) throw error;
      } else {
        throw new Error(`El canal ${channel} aún no está implementado`);
      }

      setImportSuccess(rows.length);
      toast.success(`Campaña enviada exitosamente a ${rows.length} destinatarios`);
      onSuccess?.();

    } catch (error) {
      console.error('Error al enviar la campaña:', error);
      toast.error(`Error al enviar la campaña: ${error.message}`);
      setImportErrors([{
        row: 0,
        data: { email: '', name: '', paragraph: '' },
        error: error.message
      }]);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleImport)} className="space-y-6">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proyecto de invitación</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un proyecto de invitación" />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="none" value="Ninguno">
                        Ninguno
                      </SelectItem>
                    {projects.map((project) => (
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
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal de comunicación</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
          control={form.control}
          name="customCampaign"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Campaña</FormLabel>
              <input
                {...field}
                type="text"
                placeholder="Ej: Promocion_Mayo_2025"
                className="w-full border rounded-md px-3 py-2"
              />
            </FormItem>
          )}
        />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Asunto del Correo</FormLabel>
                <input
                  {...field}
                  type="text"
                  placeholder="Ej: Invitación especial para ti"
                  className="w-full border rounded-md px-3 py-2"
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="messageType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Mensaje</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de mensaje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template">Plantilla</SelectItem>
                    <SelectItem value="plaintext">Texto Plano</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          {messageType === "template" && (
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Plantilla</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4812772">Plantilla Principal</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}

          {messageType === "plaintext" && (
            <>
              <FormField
                control={form.control}
                name="plainText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido de Texto Plano</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Escribe el contenido del email aquí..."
                      className="min-h-[100px]"
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="htmlContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenido HTML (opcional)</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="<html><body>Contenido HTML aquí...</body></html>"
                      className="min-h-[100px]"
                    />
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="space-y-4">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <AlertDescription>
                Estructura del archivo Excel para importación masiva:<br />
                <strong>Email</strong> | <strong>Name</strong> | <strong>Paragraph</strong><br />
                ejemplo@email.com | Nombre Ejemplo | Contenido del párrafo para el email
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
                Descargar Template
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
              className="w-full"
              disabled={isImporting || !file}
            >
              {isImporting ? "Enviando..." : "Enviar Campaña"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ImportCampaign;
