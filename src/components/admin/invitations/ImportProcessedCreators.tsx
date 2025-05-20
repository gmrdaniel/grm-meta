import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { FileUploader } from "@/components/admin/inventory/import-templates/components/FileUploader";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/project/projectService";
import { linkProfileToProjectById } from "@/services/profile-project/linkUserToMetaProject";
import { useAuth } from "@/hooks/useAuth";

interface ProcessedCreator {
  email: string;
  status: string;
  approvalDate: string;
}

interface ImportError {
  row: number;
  data: {
    email: string;
    status: string;
    approvalDate: string;
  };
  error: string;
}

const ImportProcessedCreators: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importedData, setImportedData] = useState<ProcessedCreator[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const { user } = useAuth();

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import.");
      return;
    }

    if (!selectedProjectId) {
      toast.error("Please select a project.");
      return;
    }

    setIsImporting(true);
    setImportedData([]);
    setImportErrors([]);

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

    const headers = jsonData[0];
    const requiredHeaders = ["Email", "Status", "Approval Date"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required headers: ${missingHeaders.join(", ")}`);
      setIsImporting(false);
      return;
    }

    const emailIndex = headers.indexOf("Email");
    const statusIndex = headers.indexOf("Status");
    const dateIndex = headers.indexOf("Approval Date");

    const processedData: ProcessedCreator[] = [];
    const errors: ImportError[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 1;
      const email = row[emailIndex]?.toString().trim();
      const status = row[statusIndex]?.toString().trim();
      const approvalDate = row[dateIndex]?.toString().trim();

      if (!email || !status || !approvalDate) {
        errors.push({
          row: rowNumber,
          data: { email, status, approvalDate },
          error: "One or more fields are missing",
        });
        continue;
      }

      try {
        await linkProfileToProjectById({ email, projectId: selectedProjectId, adminId: user?.id, status });
        processedData.push({ email, status, approvalDate });
      } catch (err: any) {
        console.error(err);
        errors.push({
          row: rowNumber,
          data: { email, status, approvalDate },
          error: err.message ?? "Unknown error",
        });
      }
    }

    setImportedData(processedData);
    setImportErrors(errors);

    if (errors.length === 0 && processedData.length > 0) {
      toast.success(`${processedData.length} creators linked successfully`);
    } else if (errors.length > 0 && processedData.length > 0) {
      toast.info(`${processedData.length} linked, ${errors.length} errors`);
    } else {
      toast.error(`Failed to link any creators`);
    }

    setIsImporting(false);
  };

  const generateExcelTemplate = () => {
    const templateData = [
      ["Email", "Status", "Approval Date"],
      ["user@example.com", "approved", "2025-05-20"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    XLSX.utils.book_append_sheet(wb, ws, "Processed Creators");
    XLSX.writeFile(wb, "processed_creators_template.xlsx");
    toast.success("Template downloaded successfully");
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Import Processed Creators</h2>
        <Button onClick={generateExcelTemplate} variant="outline" size="sm">
          Download Template
        </Button>
      </div>

      <div className="space-y-2">
        <label htmlFor="project" className="text-sm font-medium">Select Project</label>
        <Select
          onValueChange={(val) => setSelectedProjectId(val)}
          disabled={isLoadingProjects || isImporting}
        >
          <SelectTrigger id="project" className="w-full">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FileUploader file={file} setFile={setFile} />

      <Button
        onClick={handleImport}
        disabled={!file || isImporting}
        className="w-full"
      >
        {isImporting ? "Importing..." : "Import Creators"}
      </Button>

      {importedData.length > 0 && (
        <div className="mt-4">
          <p className="font-medium">✅ Imported Creators:</p>
          <ul className="text-sm list-disc ml-6">
            {importedData.map((creator, idx) => (
              <li key={idx}>
                {creator.email} - {creator.status} - {creator.approvalDate}
              </li>
            ))}
          </ul>
        </div>
      )}

      {importErrors.length > 0 && (
        <div className="mt-4">
          <p className="font-medium text-red-600">❌ Errors:</p>
          <ul className="text-sm list-disc ml-6">
            {importErrors.map((error, idx) => (
              <li key={idx}>
                Row {error.row}: {error.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default ImportProcessedCreators;
