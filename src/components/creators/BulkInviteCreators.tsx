
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, Upload, ExternalLink } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvitationDetail {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  status: string;
  invitation_link?: string;
}

export function BulkInviteCreators() {
  const [isUploading, setIsUploading] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetail[]>([]);

  const downloadTemplate = () => {
    const template = [
      ["Nombre", "Email", "Activo", "Enviar Invitación"],
      ["Juan Pérez", "juan@ejemplo.com", "TRUE", "TRUE"],
      ["María García", "maria@ejemplo.com", "TRUE", "FALSE"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
    XLSX.writeFile(wb, "plantilla_creadores.xlsx");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        // Validar datos
        const validRows = rows.filter((row: any) => {
          const isValid = row.Nombre && row.Email && 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email) &&
            (row.Activo === 'TRUE' || row.Activo === 'FALSE');
          return isValid;
        });

        if (validRows.length === 0) {
          throw new Error("No se encontraron filas válidas en el archivo");
        }

        // Crear registro de invitación masiva
        const { data: bulkInvitation, error: invitationError } = await supabase
          .from('bulk_creator_invitations')
          .insert({
            file_name: file.name,
            total_rows: rows.length,
            created_by: (await supabase.auth.getUser()).data.user?.id,
          })
          .select()
          .single();

        if (invitationError) throw invitationError;

        // Insertar detalles y generar invitaciones
        const details = validRows.map((row: any) => ({
          bulk_invitation_id: bulkInvitation.id,
          full_name: row.Nombre,
          email: row.Email,
          is_active: row.Activo === 'TRUE',
          send_invitation: row['Enviar Invitación'] === 'TRUE',
        }));

        const processedDetails: InvitationDetail[] = [];

        for (const detail of details) {
          // Insertar detalle en la tabla
          const { data: insertedDetail, error: detailError } = await supabase
            .from('bulk_creator_invitation_details')
            .insert({
              bulk_invitation_id: bulkInvitation.id,
              full_name: detail.full_name,
              email: detail.email,
              is_active: detail.is_active,
            })
            .select()
            .single();

          if (detailError) throw detailError;

          // Si se debe enviar invitación, crear una en creator_invitations
          let invitationLink = undefined;
          console.log('Detail:', detail); // Añadir log para debugging
          if (detail.send_invitation) {
            console.log('Creating invitation for:', detail.email); // Añadir log para debugging
            const { data: invitation, error: inviteError } = await supabase
              .from('creator_invitations')
              .insert({
                email: detail.email,
                service_id: null,
                status: 'pending'
              })
              .select('token')
              .single();

            if (inviteError) {
              console.error('Error creating invitation:', inviteError); // Añadir log para debugging
              throw inviteError;
            }

            if (invitation) {
              invitationLink = `${window.location.origin}/auth?invitation=${invitation.token}`;
              console.log('Invitation link created:', invitationLink); // Añadir log para debugging
            }
          }

          processedDetails.push({
            ...insertedDetail,
            invitation_link: invitationLink
          });
        }

        setInvitationDetails(processedDetails);
        toast.success(`Archivo procesado: ${validRows.length} registros válidos de ${rows.length} totales`);
      };

      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Descargar Plantilla
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="file-upload"
            className="text-sm font-medium text-gray-700"
          >
            Subir archivo completado
          </label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="relative"
              disabled={isUploading}
            >
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? "Subiendo..." : "Seleccionar archivo"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Formatos aceptados: .xlsx, .xls
          </p>
        </div>
      </div>

      {invitationDetails.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Creadores Importados</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Link de Invitación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitationDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>{detail.full_name}</TableCell>
                    <TableCell>{detail.email}</TableCell>
                    <TableCell>{detail.is_active ? 'Activo' : 'Inactivo'}</TableCell>
                    <TableCell>
                      {detail.invitation_link ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => copyToClipboard(detail.invitation_link!)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Copiar Link
                        </Button>
                      ) : (
                        'No requiere invitación'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
