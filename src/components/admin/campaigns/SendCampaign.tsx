import React, { useState } from "react";
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

interface ImportCampaignProps {
  onSuccess?: () => void;
}

interface ImportError {
  row: number;
  data: {
    email: string;
    name?: string;
    subject: string;
    variables: Record<string, string>;
  };
  error: string;
}

const formSchema = z.object({
  channel: z.enum(["email", "instagram", "whatsapp", "telegram"]),
  messageType: z.enum(["template", "plaintext"]),
  templateId: z.string().optional(),
  plainText: z.string().optional(),
  htmlContent: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ImportCampaign: React.FC<ImportCampaignProps> = ({ onSuccess }) => {
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
    },
  });

  const messageType = form.watch("messageType");
  const channel = form.watch("channel");

  const handleDownloadTemplate = () => {
    const template = [
      ["Email", "Name", "Subject", "Variables"],
      ["ejemplo@email.com", "Nombre Ejemplo", "Asunto del Email", '{"nombre":"Juan","empresa":"MiEmpresa"}']
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
      const requiredHeaders = ["Email", "Name", "Subject", "Variables"];

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
      const subjectIndex = headers.indexOf("Subject");
      const variablesIndex = headers.indexOf("Variables");

      // Process rows
      const rows = jsonData.slice(1).map((row: any) => {
        try {
          return {
            email: row[emailIndex],
            name: row[nameIndex],
            subject: row[subjectIndex],
            variables: JSON.parse(row[variablesIndex] || "{}")
          };
        } catch (error) {
          throw new Error(`Error al procesar variables: ${error.message}`);
        }
      });

      if (channel === "email") {
        // Send campaign using Supabase Edge Function mailjet-campaign
        const { data: response, error } = await supabase.functions.invoke('mailjet-campaign', {
          body: {
            templateId: values.messageType === 'template' ? values.templateId : undefined,
            textContent: values.messageType === 'plaintext' ? values.plainText : undefined,
            htmlContent: values.htmlContent,
            recipients: rows.map(row => ({
              email: row.email,
              name: row.name,
              variables: row.variables
            })),
            subject: rows[0].subject // Usando el primer subject como subject general
          }
        });

        if (error) throw error;
      } else {
        // Aquí se implementará la lógica para otros canales
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
        data: { email: '', subject: '', variables: {} },
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
                  <strong>Email</strong> | <strong>Name</strong> | <strong>Subject</strong> | <strong>Variables</strong><br />
                  ejemplo@email.com | Nombre Ejemplo | Asunto del Email | ""nombre":"Juan","empresa":"MiEmpresa"
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
