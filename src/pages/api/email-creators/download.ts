
import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sourceFile } = req.query;

    if (!sourceFile || typeof sourceFile !== "string") {
      return res.status(400).json({ error: "Source file parameter is required" });
    }

    // Fetch all creators for the specified source file
    const { data, error } = await supabase
      .from("email_creators")
      .select("*")
      .eq("source_file", sourceFile);

    if (error) {
      console.error("Error fetching creators for download:", error);
      return res.status(500).json({ error: "Failed to fetch creators" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No records found for this source file" });
    }

    // Format the export data
    const exportData = data.map(creator => {
      let paragraphs: string[] = [];
      
      if (creator.prompt_output) {
        paragraphs = creator.prompt_output
          .split(/\n\s*\n/)
          .map(p => p.trim())
          .filter(p => p.length > 0);
      }
      
      const baseObject: Record<string, string> = {
        "Full_name": creator.full_name || "",
        "Email": creator.email || "",
        "TikTok_link": creator.tiktok_link || "",
        "meta_content_invitation": creator.link_invitation || "",
        "Source_file": creator.source_file || "Unknown",
        "Status": creator.prompt_output ? "Completed" : "Pending",
      };
      
      for (let i = 1; i <= 11; i++) {
        const paragraphIndex = i - 1;
        if (paragraphIndex < paragraphs.length) {
          baseObject[`Paragraph ${i}`] = paragraphs[paragraphIndex].replace(/\n/g, ' ');
        } else {
          baseObject[`Paragraph ${i}`] = "";
        }
      }
      
      return baseObject;
    });

    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const columnWidths = [
      { wch: 25 },  // Full_name
      { wch: 30 },  // Email
      { wch: 35 },  // TikTok_link
      { wch: 35 },  // meta_content_invitation
      { wch: 25 },  // Source_file
      { wch: 15 },  // Status
    ];
    
    for (let i = 0; i < 11; i++) {
      columnWidths.push({ wch: 100 }); // Setting wide columns for paragraphs
    }
    
    worksheet['!cols'] = columnWidths;

    // Apply cell styling
    for (let i = 0; i < exportData.length; i++) {
      for (let col = 5; col <= 16; col++) { // Paragraph columns (6-16)
        const cellRef = XLSX.utils.encode_cell({r: i+1, c: col});
        if (!worksheet[cellRef]) continue;
        
        if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
        worksheet[cellRef].s.alignment = { wrapText: true, vertical: 'top' };
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "EmailCreators");

    // Generate the Excel file as buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${encodeURIComponent(sourceFile.replace(/\s+/g, '_'))}_export_${new Date().toISOString().split("T")[0]}.xlsx`);
    
    // Send the file
    res.send(buffer);
  } catch (error) {
    console.error("Error in download API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
