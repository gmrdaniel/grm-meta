import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ImportError } from "./types";
import { ImportResultCard } from "./components/ImportResultCard";
import { FileUploader } from "./components/FileUploader";
import { ImportMethodSelector } from "./components/ImportMethodSelector";
import {
  generateExcelTemplate,
  processExcelFile,
  processImportData,
} from "./utils/importUtils";

interface TikTokImportTemplateProps {
  onSuccess?: () => void;
}

export function TikTokImportTemplate({ onSuccess }: TikTokImportTemplateProps) {
  const [inputData, setInputData] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importSuccess, setImportSuccess] = useState<number>(0);
  const [importMethod, setImportMethod] = useState<"csv" | "excel">("csv");
  const [file, setFile] = useState<File | null>(null);

  const downloadTemplate = () => {
    generateExcelTemplate();
  };

  const importMutation = useMutation({
    mutationFn: async (csvData: string) => {
      return processImportData(csvData, setImportErrors, setImportSuccess);
    },
  });

  const excelFileMutation = useMutation({
    mutationFn: processExcelFile,
  });

  const handleProcessExcelFile = async () => {
    if (!file) {
      return;
    }

    setIsProcessing(true);

    try {
      const csvData = await excelFileMutation.mutateAsync(file);

      console.log(csvData);
      
      setInputData(csvData);
      await importMutation.mutateAsync(csvData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing Excel file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportCsv = async () => {
    setIsProcessing(true);

    try {
      await importMutation.mutateAsync(inputData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSuccess && onSuccess()}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-xl font-bold">Template: TikTok User</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import Creators with TikTok</CardTitle>
          <CardDescription>
            Import multiple creators with their basic information and TikTok
            username
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Format: first name, last name, email, TikTok user
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Excel Template
            </Button>
          </div>

          <div className="border rounded-md p-4 bg-gray-50">
            <ImportMethodSelector
              importMethod={importMethod}
              setImportMethod={setImportMethod}
            />

            {importMethod === "excel" ? (
              <FileUploader file={file} onFileSelect={setFile} />
            ) : (
              <Textarea
                placeholder="Paste the data here in CSV format or write directly respecting the format"
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            )}
          </div>

          <Alert
            variant="default"
            className="bg-blue-50 text-blue-800 border-blue-200"
          >
            <AlertDescription className="text-sm">
              The first row should contain the headers: first_name, last_name,
              email, tiktok_user
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            disabled={isProcessing}
            onClick={
              importMethod === "excel"
                ? handleProcessExcelFile
                : handleImportCsv
            }
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import Data
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <ImportResultCard
        importErrors={importErrors}
        importSuccess={importSuccess}
      />
    </div>
  );
}
