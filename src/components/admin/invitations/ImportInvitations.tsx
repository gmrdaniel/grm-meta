
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/projectService";
import { createInvitation } from "@/services/invitation/createInvitation";
import { CreateInvitationData } from "@/types/invitation";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { ImportResultCard } from "@/components/admin/invitations/ImportResultCard";

interface ImportInvitationsProps {
  onSuccess?: () => void;
}

interface ImportError {
  row: number;
  data: {
    name: string;
    email: string;
    socialMediaHandle: string;
    socialMediaType: string;
  };
  error: string;
}

const ImportInvitations: React.FC<ImportInvitationsProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [projectId, setProjectId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project");
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
      const requiredHeaders = ["Creator Name", "Email Address", "Social Media Handle", "Social Media Platform"];
      
      // Check if all required headers are present
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        toast.error(`Missing required headers: ${missingHeaders.join(", ")}`);
        setIsImporting(false);
        return;
      }

      // Get column indices
      const nameIndex = headers.indexOf("Creator Name");
      const emailIndex = headers.indexOf("Email Address");
      const handleIndex = headers.indexOf("Social Media Handle");
      const platformIndex = headers.indexOf("Social Media Platform");

      // Process data rows (skip the header row)
      const errors: ImportError[] = [];
      let successCount = 0;

      // Process data rows one by one
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNumber = i + 1;

        // Skip empty rows
        if (!row || row.length === 0) continue;

        const fullName = row[nameIndex]?.toString().trim();
        const email = row[emailIndex]?.toString().trim();
        const socialMediaHandle = row[handleIndex]?.toString().trim();
        const socialMediaType = row[platformIndex]?.toString().trim() || "tiktok";

        // Validate row data
        const rowErrors = [];
        if (!fullName) rowErrors.push("Creator Name is required");
        if (!email) {
          rowErrors.push("Email Address is required");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          rowErrors.push("Invalid email format");
        }

        if (rowErrors.length > 0) {
          errors.push({
            row: rowNumber,
            data: {
              name: fullName || "",
              email: email || "",
              socialMediaHandle: socialMediaHandle || "",
              socialMediaType: socialMediaType
            },
            error: rowErrors.join(", ")
          });
          continue;
        }

        // Create invitation
        try {
          const invitationData: CreateInvitationData = {
            full_name: fullName,
            email: email,
            social_media_handle: socialMediaHandle || null,
            social_media_type: socialMediaType || null,
            project_id: projectId,
            invitation_type: "creator"
          };

          await createInvitation(invitationData);
          successCount++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          errors.push({
            row: rowNumber,
            data: {
              name: fullName || "",
              email: email || "",
              socialMediaHandle: socialMediaHandle || "",
              socialMediaType: socialMediaType
            },
            error: errorMessage
          });
        }
      }

      setImportErrors(errors);
      setImportSuccess(successCount);

      // Show toast message based on results
      if (errors.length === 0 && successCount > 0) {
        toast.success(`${successCount} invitations imported successfully`);
        if (onSuccess) onSuccess();
      } else if (errors.length > 0 && successCount > 0) {
        toast.info(`Partial import: ${successCount} invitations imported, ${errors.length} errors`);
      } else if (errors.length > 0 && successCount === 0) {
        toast.error(`Import failed with ${errors.length} errors`);
      }
    } catch (error) {
      console.error("Error importing invitations:", error);
      toast.error("Error processing Excel file");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FormItem>
          <FormLabel>Select Project</FormLabel>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>

        <div className="space-y-2">
          <p className="text-sm font-medium">Upload Excel File</p>
          <p className="text-sm text-gray-500 mb-2">
            The Excel file should have the following headers: <br />
            <code className="text-xs bg-gray-100 p-1 rounded">Creator Name, Email Address, Social Media Handle, Social Media Platform</code>
          </p>
          <FileUploader file={file} setFile={setFile} />
        </div>

        <Button 
          onClick={handleImport} 
          disabled={!file || !projectId || isImporting}
          className="w-full mt-4"
        >
          {isImporting ? "Importing..." : "Import Invitations"}
        </Button>
      </div>

      {(importSuccess > 0 || importErrors.length > 0) && (
        <ImportResultCard importErrors={importErrors} importSuccess={importSuccess} />
      )}
    </div>
  );
};

export default ImportInvitations;
