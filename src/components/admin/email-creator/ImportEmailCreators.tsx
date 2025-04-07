
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Upload } from "lucide-react";
import { importEmailCreatorsFromExcel } from "@/services/emailCreatorService";
import { EmailCreatorImportResult } from "@/types/email-creator";
import { toast } from "sonner";

interface ImportEmailCreatorsProps {
  onImportComplete: () => void;
}

export const ImportEmailCreators: React.FC<ImportEmailCreatorsProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<EmailCreatorImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importEmailCreatorsFromExcel(file);
      setImportResult(result);
      
      if (result.successful > 0) {
        if (result.failed === 0) {
          toast.success(`Successfully imported ${result.successful} creators`);
        } else {
          toast.info(`Imported ${result.successful} creators with ${result.failed} errors`);
        }
      } else if (result.failed > 0) {
        toast.error(`Failed to import creators. ${result.failed} errors found.`);
      }
      
      onImportComplete();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Email Creators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6">
            <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center mb-4">
              Upload an Excel file with columns "Nombre" and "Link de TikTok"
            </p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" disabled={isImporting}>
                {file ? file.name : "Select File"}
              </Button>
            </label>
          </div>

          {file && (
            <div className="flex justify-center">
              <Button 
                onClick={handleImport} 
                disabled={isImporting}
                className="w-full md:w-auto"
              >
                {isImporting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Creators
                  </>
                )}
              </Button>
            </div>
          )}

          {importResult && (
            <div className="mt-4 p-4 rounded-md bg-gray-50">
              <h3 className="text-md font-medium mb-2">Import Results</h3>
              <div className="flex flex-wrap gap-4">
                <div className="bg-green-100 text-green-800 p-3 rounded-md">
                  <span className="font-medium">Successful:</span> {importResult.successful}
                </div>
                <div className="bg-red-100 text-red-800 p-3 rounded-md">
                  <span className="font-medium">Failed:</span> {importResult.failed}
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto bg-white rounded border p-2">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm py-1 border-b last:border-b-0">
                        <span className="font-medium">Row {error.row}:</span> {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
