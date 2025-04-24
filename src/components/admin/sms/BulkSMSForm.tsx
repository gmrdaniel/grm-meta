import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTemplates } from "@/hooks/useTemplates";
import { TemplateSelector } from "./TemplateSelector";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileUploader } from "../inventory/import-templates/components/FileUploader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";

interface Contact {
  countryCode: string;
  phoneNumber: string;
  name: string;
  linkInvitation: string;
}

export function BulkSMSForm() {
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: templates } = useTemplates();

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedContacts: Contact[] = [];
      let hasErrors = false;

      jsonData.forEach((row: any, index) => {
        if (!row["Código de país"] || !row["Número de teléfono"] || !row["Nombre"]) {
          toast.error(`Fila ${index + 2}: Faltan campos obligatorios`);
          hasErrors = true;
          return;
        }

        parsedContacts.push({
          countryCode: String(row["Código de país"]).replace(/\D/g, ''),
          phoneNumber: String(row["Número de teléfono"]).replace(/\D/g, ''),
          name: row["Nombre"],
          linkInvitation: row["Link de invitación"] || ""
        });
      });

      if (!hasErrors) {
        setContacts(parsedContacts);
        toast.success(`${parsedContacts.length} contactos cargados correctamente`);
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error al procesar el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendBulkSMS = async () => {
    setShowConfirmDialog(false);
    
    if (!selectedTemplateId) {
      toast.error("Por favor selecciona una plantilla");
      return;
    }

    if (contacts.length === 0) {
      toast.error("No hay contactos para enviar");
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;

    const template = templates?.find(t => t.id === selectedTemplateId);
    if (!template) {
      toast.error("Plantilla no encontrada");
      setIsLoading(false);
      return;
    }

    for (const contact of contacts) {
      try {
        let processedMessage = template.message;
        
        if (contact.name) {
          processedMessage = processedMessage.replace(/\{nombre\}/g, contact.name);
        }
        
        if (contact.linkInvitation) {
          processedMessage = processedMessage.replace(/\{link_invitation\}/g, contact.linkInvitation);
        }
        
        processedMessage = processedMessage.replace(/\{nombre\}/g, "");
        processedMessage = processedMessage.replace(/\{link_invitation\}/g, "");

        const { error } = await supabase.functions.invoke('send-sms', {
          body: {
            phoneNumber: contact.phoneNumber,
            countryCode: contact.countryCode,
            name: contact.name,
            message: processedMessage,
            templateId: selectedTemplateId,
            sentBy: user?.id
          }
        });

        if (error) {
          console.error(`Error sending SMS to ${contact.name}:`, error);
          errorCount++;
        } else {
          successCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error sending SMS to ${contact.name}:`, error);
        errorCount++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['sms_logs'] });
    setIsLoading(false);
    
    if (errorCount === 0) {
      toast.success(`${successCount} mensajes enviados exitosamente`);
    } else {
      toast.warning(`${successCount} mensajes enviados, ${errorCount} con errores`);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ["Country code", "Phone number", "Name", "Invitation link"],
      ["1", "1234567890", "John Doe", "https://example.com/invite/123"],
      ["44", "2345678901", "Jane Smith", ""]
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "SMS Contacts Template");
    XLSX.writeFile(wb, "sms_contacts_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Bulk SMS Sending</h2>
        <Button 
          variant="outline" 
          onClick={downloadTemplate}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-dashed p-4">
          <h3 className="text-sm font-medium mb-2">Paso 1: Cargar archivo Excel</h3>
          <p className="text-sm text-gray-500 mb-4">
            El archivo debe tener las columnas: "Código de país", "Número de teléfono", "Nombre", "Link de invitación" (opcional)
          </p>
          <FileUploader file={file} setFile={setFile} />
          
          <div className="mt-4">
            <Button 
              onClick={handleFileUpload} 
              disabled={!file || isUploading}
              className="w-full"
            >
              {isUploading ? "Procesando..." : "Cargar contactos"}
            </Button>
          </div>
        </div>

        {contacts.length > 0 && (
          <>
            <div className="rounded-lg border border-dashed p-4">
              <h3 className="text-sm font-medium mb-2">Paso 2: Seleccionar plantilla</h3>
              <TemplateSelector
                templates={templates}
                selectedTemplateId={selectedTemplateId}
                onTemplateSelect={setSelectedTemplateId}
              />
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <h3 className="text-sm font-medium mb-2">Paso 3: Revisar contactos cargados</h3>
              <div className="max-h-60 overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código de país</TableHead>
                      <TableHead>Número de teléfono</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Link de invitación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact, index) => (
                      <TableRow key={index}>
                        <TableCell>{contact.countryCode}</TableCell>
                        <TableCell>{contact.phoneNumber}</TableCell>
                        <TableCell>{contact.name}</TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {contact.linkInvitation || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Total: {contacts.length} contactos
              </div>
            </div>

            <Button 
              onClick={() => setShowConfirmDialog(true)} 
              disabled={!selectedTemplateId || isLoading || contacts.length === 0}
              className="w-full"
            >
              {isLoading ? "Enviando..." : `Enviar ${contacts.length} SMS`}
            </Button>
          </>
        )}
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de enviar {contacts.length} SMS. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendBulkSMS}>
              Confirmar envío
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
