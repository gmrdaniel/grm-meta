import * as XLSX from 'xlsx';
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";

export const exportToExcel = (
  data: CreatorInvitation[],
  filename: string,
  startDate?: Date,
  endDate?: Date,
  statuses: string[] = []
) => {
  try {
    //  Eliminar el filtrado
    const exportData = data.map((invitation) => ({
      "First Name": invitation.first_name,
      "Email": invitation.email,
      "Social Media Handle": invitation.social_media_handle || "",
      "Social Media Platform": invitation.social_media_type || "",
      "Facebook profile":invitation.facebook_profile,
      "Facebook page":invitation.facebook_page,
      "Phone number":invitation.phone_number,
      "Invitation Code": invitation.invitation_code,
      "Status": invitation.status,
      "Invitation Type": invitation.invitation_type === "new_user" ? "New User" : "Existing User",
      "Created At": new Date(invitation.created_at).toLocaleString(),
    }));

    // Crear hoja y libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Nombre del archivo
    const now = new Date().toISOString().split('T')[0];
    const actualFilename = `${filename}_${now}.xlsx`;

    // Guardar archivo
    XLSX.writeFile(workbook, actualFilename);
    toast.success(`${filename} exported successfully`);
    return true;

  } catch (error) {
    console.error(`Error exportando ${filename}:`, error);
    toast.error(`Export error${filename}`);
    return false;
  }
};
