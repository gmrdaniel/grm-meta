
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

// Expected column names and their alternatives
const COLUMN_MAPPINGS = {
  countryCode: ["Código de país", "Country code", "CountryCode", "Country Code", "código país", "codigo pais", "codigo de pais"],
  phoneNumber: ["Número de teléfono", "Phone number", "PhoneNumber", "Phone Number", "telefono", "teléfono", "numero", "número"],
  name: ["Nombre", "Name", "nombre", "FullName", "Full Name", "Nombre Completo"],
  linkInvitation: ["Link de invitación", "Invitation link", "InvitationLink", "Invitation Link", "link", "enlace", "url"]
};

export function BulkSMSForm() {
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: templates } = useTemplates();

  // Find the matching column name in the Excel file
  const findColumnInData = (data: any, columnOptions: string[]): string | null => {
    const headers = Object.keys(data[0] || {});
    for (const option of columnOptions) {
      if (headers.includes(option)) {
        return option;
      }
    }
    return null;
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo");
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        toast.error("El archivo no contiene datos");
        setIsUploading(false);
        return;
      }

      console.log("Excel data:", jsonData);
      
      // Find matching column names
      const countryCodeCol = findColumnInData(jsonData, COLUMN_MAPPINGS.countryCode);
      const phoneNumberCol = findColumnInData(jsonData, COLUMN_MAPPINGS.phoneNumber);
      const nameCol = findColumnInData(jsonData, COLUMN_MAPPINGS.name);
      const linkCol = findColumnInData(jsonData, COLUMN_MAPPINGS.linkInvitation);
      
      // Validate required columns
      const missingColumns = [];
      if (!countryCodeCol) missingColumns.push("Código de país");
      if (!phoneNumberCol) missingColumns.push("Número de teléfono");
      if (!nameCol) missingColumns.push("Nombre");
      
      if (missingColumns.length > 0) {
        toast.error(`Columnas requeridas no encontradas: ${missingColumns.join(", ")}`);
        setIsUploading(false);
        return;
      }

      const parsedContacts: Contact[] = [];
      const errors: string[] = [];

      jsonData.forEach((row: any, index) => {
        const rowNumber = index + 2; // +2 because Excel rows start at 1 and we have a header row
        
        const countryCode = row[countryCodeCol];
        const phoneNumber = row[phoneNumberCol];
        const name = row[nameCol];
        const link = linkCol ? row[linkCol] : '';
        
        if (!countryCode) {
          errors.push(`Fila ${rowNumber}: Falta el código de país`);
          return;
        }
        
        if (!phoneNumber) {
          errors.push(`Fila ${rowNumber}: Falta el número de teléfono`);
          return;
        }
        
        if (!name) {
          errors.push(`Fila ${rowNumber}: Falta el nombre`);
          return;
        }

        parsedContacts.push({
          countryCode: String(countryCode).replace(/\D/g, ''),
          phoneNumber: String(phoneNumber).replace(/\D/g, ''),
          name: String(name),
          linkInvitation: link ? String(link) : ""
        });
      });

      setUploadErrors(errors);
      
      if (parsedContacts.length > 0) {
        setContacts(parsedContacts);
        
        if (errors.length > 0) {
          toast.warning(`${parsedContacts.length} contactos cargados con ${errors.length} errores`);
        } else {
          toast.success(`${parsedContacts.length} contactos cargados correctamente`);
        }
      } else {
        toast.error("No se pudieron cargar contactos. Verifica el formato del archivo.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error al procesar el archivo. Verifica que sea un archivo Excel válido.");
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
      ["Código de país", "Número de teléfono", "Nombre", "Link de invitación"],
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
          
          {uploadErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-100">
              <h4 className="text-sm font-medium text-red-800 mb-1">Errores encontrados:</h4>
              <div className="max-h-32 overflow-y-auto">
                <ul className="text-xs text-red-700 list-disc pl-5">
                  {uploadErrors.map((error, index) => (
                    <li key={index} className="mb-1">{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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
