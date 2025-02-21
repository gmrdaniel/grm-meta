
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export interface ProcessedRow {
  bulk_invitation_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  send_invitation: boolean;
  service_id?: string;
}

export const getDefaultService = async () => {
  const { data: services, error } = await supabase
    .from('services')
    .select('id, name')
    .eq('name', 'Contrato NO exclusivo')
    .single();

  if (error) throw error;
  return services;
};

export const processExcelFile = async (file: File, serviceId: string) => {
  return new Promise<ProcessedRow[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
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

        // Verificar correos duplicados en la base de datos
        const emails = validRows.map((row: any) => row.Email);
        const { data: existingInvitations } = await supabase
          .from('creator_invitations')
          .select('email')
          .in('email', emails)
          .eq('status', 'pending');

        if (existingInvitations && existingInvitations.length > 0) {
          const duplicateEmails = existingInvitations.map(inv => inv.email).join(', ');
          throw new Error(`Los siguientes correos ya tienen invitaciones pendientes: ${duplicateEmails}`);
        }

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

        const details = validRows.map((row: any) => ({
          bulk_invitation_id: bulkInvitation.id,
          full_name: row.Nombre,
          email: row.Email,
          is_active: row.Activo === 'TRUE',
          send_invitation: row['Enviar Invitación'] === 'TRUE',
          service_id: serviceId,
        }));

        resolve(details);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export const createInvitation = async (detail: ProcessedRow) => {
  const { data: insertedDetail, error: detailError } = await supabase
    .from('bulk_creator_invitation_details')
    .insert({
      bulk_invitation_id: detail.bulk_invitation_id,
      full_name: detail.full_name,
      email: detail.email,
      is_active: detail.is_active,
    })
    .select()
    .single();

  if (detailError) throw detailError;

  let invitationLink = undefined;
  if (detail.send_invitation) {
    const { data: invitation, error: inviteError } = await supabase
      .from('creator_invitations')
      .insert({
        email: detail.email,
        service_id: detail.service_id,
        status: 'pending'
      })
      .select('token')
      .single();

    if (inviteError) throw inviteError;

    if (invitation) {
      invitationLink = `${window.location.origin}/auth?invitation=${invitation.token}`;
    }
  }

  return { ...insertedDetail, invitation_link: invitationLink };
};
