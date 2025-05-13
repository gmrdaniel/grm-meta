
import * as XLSX from 'xlsx';
import { CreatorInvitation } from "@/types/invitation";
import { toast } from "sonner";

export const exportToExcel = (data: any[], filename: string, date?: Date) => {
  try {
    // Transform data for export
/*     const newData = data.map(invitation => ({
      "Fisrt Name": invitation.first_name,
      "Email": invitation.email,
      "Social Media Handle": invitation.social_media_handle || "",
      "Social Media Platform": invitation.social_media_type || "",
      "Invitation Code": invitation.invitation_code,
      "Status": invitation.status,
      "Invitation Type": invitation.invitation_type === "new_user" ? "New User" : "Existing User",
      "Created At": new Date(invitation.created_at).toLocaleString(),
    })); */

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Page");
    
    // Generate Excel file
    let actualFilename = ''
    if(date) actualFilename = `${filename}_${date.toISOString().split('T')[0]}.xlsx`;
    if(!date) actualFilename = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, actualFilename);
    
    toast.success(`${filename} exported successfully`);
    return true;
  } catch (error) {
    console.error(`Error exporting ${filename}:`, error);
    toast.error(`Failed to export ${filename}`);
    return false;
  }
};