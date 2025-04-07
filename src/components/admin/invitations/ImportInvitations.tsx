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
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/projectService";
import { createInvitation } from "@/services/invitation/createInvitation";
import { CreateInvitationData } from "@/types/invitation";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download } from "lucide-react";
import { ImportResultCard } from "./ImportResultCard";

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

// Define form schema
const formSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  invitationType: z.string().min(1, "Invitation type is required"),
});

type FormValues = z.infer<typeof formSchema>;

const ImportInvitations: React.FC<ImportInvitationsProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId: "",
      invitationType: "new_user", // Set default value to "new_user"
    },
  });

  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

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
      const requiredHeaders = [
        "Creator Name",
        "Email Address",
        "Social Media Handle",
        "Social Media Platform",
      ];

      // Check if all required headers are present
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );
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
        const socialMediaType =
          row[platformIndex]?.toString().trim() || "tiktok";

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
              socialMediaType: socialMediaType,
            },
            error: rowErrors.join(", "),
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
            project_id: values.projectId,
            invitation_type: values.invitationType, // Use the updated invitation type value
          };

          console.log("Creating invitation with data:", invitationData);

          await createInvitation(invitationData);
          successCount++;
        } catch (error) {
          console.error("Error creating invitation:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          errors.push({
            row: rowNumber,
            data: {
              name: fullName || "",
              email: email || "",
              socialMediaHandle: socialMediaHandle || "",
              socialMediaType: socialMediaType,
            },
            error: errorMessage,
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
        toast.info(
          `Partial import: ${successCount} invitations imported, ${errors.length} errors`
        );
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

  const generateExcelTemplate = () => {
    // Create template data with headers and example row
    const templateData = [
      [
        "Creator Name",
        "Email Address",
        "Social Media Handle",
        "Social Media Platform",
      ],
      ["John Doe", "john@example.com", "johndoe", "tiktok"],
      ["Jane Smith", "jane@example.com", "janesmith", "tiktok"],
    ];

    // Create new workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Invitations Template");

    // Write and download the file
    XLSX.writeFile(wb, "creator_invitations_template.xlsx");

    toast.success("Template downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleImport)} className="space-y-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting}
                >
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
            )}
          />

          <FormField
            control={form.control}
            name="invitationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invitation Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isImporting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select invitation type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new_user">New User</SelectItem>
                    <SelectItem value="existing_user">Existing User</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Upload Excel File</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateExcelTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              The Excel file should have the following headers: <br />
              <code className="text-xs bg-gray-100 p-1 rounded">
                Creator Name, Email Address, Social Media Handle, Social Media
                Platform
              </code>
            </p>
            <FileUploader file={file} setFile={setFile} />
          </div>

          <Button
            type="submit"
            disabled={!file || isImporting}
            className="w-full mt-4"
          >
            {isImporting ? "Importing..." : "Import Invitations"}
          </Button>
        </form>
      </Form>

      {(importSuccess > 0 || importErrors.length > 0) && (
        <ImportResultCard
          importErrors={importErrors}
          importSuccess={importSuccess}
        />
      )}
    </div>
  );
};

export default ImportInvitations;
