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
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Importar la función createInvitation
import { createInvitation } from "@/services/invitation/createInvitation";

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
  customCampaign: z.string().min(1, "You must enter a campaign name"),
  deduplicateCampaign: z.boolean().optional(),
  subject: z.string().min(1, "You must enter a subject for the email"),
  generateInvitations: z.boolean().default(false),
  projectId: z.string().min(1, "You must select a project"),
});

type FormValues = z.infer<typeof formSchema>;

const ImportCampaign: React.FC<ImportCampaignProps> = ({ onSuccess }) => {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("name");

      if (error) {
        toast.error("Error loading projects");
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
      projectId: null,
    },
  });

  const messageType = form.watch("messageType");
  const channel = form.watch("channel");

  const handleDownloadTemplate = () => {
    const template = [
      ["Email", "Name", "Paragraph"],
      [
        "ejemplo@email.com",
        "Nombre Ejemplo",
        "Paragraph content for the email",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "campaign-template.xlsx");
  };

  const handleImport = async (values: FormValues) => {
    if (!file) {
      toast.error("Please select a file to import");
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
        toast.error(
          `Required headers are missing: ${missingHeaders.join(", ")}`
        );
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
        paragraph: row[paragraphIndex],
      }));

      if (channel === "email") {
        // Procesar las filas y generar invitaciones si es necesario
        const processedRows = await Promise.all(
          rows.map(async (row) => {
            let invitationData = {};
            if (values.projectId && values.projectId != "None") {
              try {
                const invitation = await createInvitation({
                  project_id: values.projectId,
                  email: row.email,
                  first_name: row.name.split(" ")[0] || row.email.split("@")[0],
                  last_name: row.name.split(" ").slice(1).join(" ") || "",
                  invitation_type: "new_user",
                  social_media_type: "pinterest",
                });

                invitationData = {
                  invitation_code: invitation.invitation_code,
                  invitation_url: invitation.invitation_url,
                };
              } catch (error) {
                console.error("Error generating invitation:", error);
              }
            }

            return {
              email: row.email,
              name: row.name,
              variables: {
                paragraph: row.paragraph,
                invitationCode: invitationData.invitation_code || "NO CODE",
                invitationUrl: invitationData.invitation_url || "NO URL",
              },
            };
          })
        );

        const { data: response, error } = await supabase.functions.invoke(
          "mailjet-campaign",
          {
            body: {
              templateId:
                values.messageType === "template"
                  ? values.templateId
                  : undefined,
              textContent:
                values.messageType === "plaintext"
                  ? values.plainText
                  : undefined,
              htmlContent: values.htmlContent,
              recipients: processedRows,
              subject: values.subject,
              customCampaign: values.customCampaign,
              //deduplicateCampaign: values.deduplicateCampaign
            },
          }
        );
        console.log(processedRows);
        if (error) throw error;
      } else {
        throw new Error(`The channel ${channel} is not yet implemented`);
      }

      setImportSuccess(rows.length);
      toast.success(`Campaign successfully sent to ${rows.length} recipients`);
      onSuccess?.();
    } catch (error) {
      console.error("Error al enviar la campaña:", error);
      toast.error(`Error sending campaign: ${error.message}`);
      setImportErrors([
        {
          row: 0,
          data: { email: "", name: "", paragraph: "" },
          error: error.message,
        },
      ]);
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
                <FormLabel>Invitation Project</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invitation project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="none" value="None">
                      None
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
                <FormLabel>Communication channel</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel" />
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
                <FormLabel>Campaign Name</FormLabel>
                <input
                  {...field}
                  type="text"
                  placeholder="Ej: Promocion_May_2025"
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
                <FormLabel>Mail Subject</FormLabel>
                <input
                  {...field}
                  type="text"
                  placeholder="Ej: Special invitation for you"
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
                <FormLabel>Message Type</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the message type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="plaintext">Plain Text</SelectItem>
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
                  <FormLabel>Template ID</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4812772">Main Template</SelectItem>
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
                    <FormLabel>Plain Text Content</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="Write the content of the email here..."
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
                    <FormLabel>HTML Content (optional)</FormLabel>
                    <Textarea
                      {...field}
                      placeholder="<html><body>HTML content here...</body></html>"
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
                  Excel file structure for bulk import: <br />
                  <strong>Email</strong> | <strong>Name</strong> |{" "}
                  <strong>Paragraph</strong>
                  <br />
                  example@email.com | Name Example | Paragraph content for email
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
                Download Template
              </Button>
            </div>

            <FileUploader
              file={file}
              onFileSelect={setFile}
              accept=".xlsx,.xls"
              label="Drag and drop your Excel file here"
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isImporting || !file}
            >
              {isImporting ? "Sending..." : "Send Campaign"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ImportCampaign;
