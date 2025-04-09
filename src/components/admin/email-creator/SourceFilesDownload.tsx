
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { getSourceFilesSummary, updateEmailCreatorPrompt } from "@/services/emailCreatorService";
import { SourceFileSummary } from "@/types/email-creator";
import { BulkGenerateTextModal } from "./BulkGenerateTextModal";

interface SourceFilesDownloadProps {
  onRefresh: () => void;
}

export const SourceFilesDownload: React.FC<SourceFilesDownloadProps> = ({ onRefresh }) => {
  const [sourceFiles, setSourceFiles] = useState<SourceFileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSourceFile, setSelectedSourceFile] = useState<string | null>(null);
  const [isBulkGenerateModalOpen, setIsBulkGenerateModalOpen] = useState(false);
  const [pendingCreators, setPendingCreators] = useState<any[]>([]);

  useEffect(() => {
    fetchSourceFiles();
  }, []);

  const fetchSourceFiles = async () => {
    setIsLoading(true);
    try {
      const summary = await getSourceFilesSummary();
      setSourceFiles(summary);
    } catch (error) {
      console.error("Error fetching source files summary:", error);
      toast.error("Failed to load source files summary");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (sourceFile: string) => {
    // Use the existing handleDownloadSelected function from useEmailCreators
    // But pass sourceFile parameter to filter by source file
    try {
      const link = document.createElement('a');
      link.href = `/api/email-creators/download?sourceFile=${encodeURIComponent(sourceFile)}`;
      link.setAttribute('download', `${sourceFile.replace(/\s+/g, '_')}_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading file ${sourceFile}`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const handleProcessPending = async (sourceFile: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/email-creators/pending?sourceFile=${encodeURIComponent(sourceFile)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch pending creators: ${response.statusText}`);
      }
      
      const data = await response.json();
      setPendingCreators(data);
      setSelectedSourceFile(sourceFile);
      setIsBulkGenerateModalOpen(true);
    } catch (error) {
      console.error("Error fetching pending creators:", error);
      toast.error("Failed to load pending creators");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkGenerateSuccess = () => {
    fetchSourceFiles();
    onRefresh();
  };

  if (isLoading && sourceFiles.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-b-transparent"></div>
      </div>
    );
  }

  if (sourceFiles.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <p className="text-muted-foreground">No source files found. Import some creators first.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={fetchSourceFiles}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Source Files Summary</h2>
        <Button variant="outline" onClick={fetchSourceFiles}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sourceFiles.map((file) => (
          <Card key={file.sourceFile}>
            <CardHeader>
              <CardTitle className="truncate" title={file.sourceFile}>
                {file.sourceFile || "Manual Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Records:</span>
                  <span className="font-medium">{file.totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processed:</span>
                  <span className="font-medium text-green-600">{file.processedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending:</span>
                  <span className="font-medium text-amber-600">{file.pendingCount}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {file.pendingCount > 0 && (
                <Button 
                  variant="secondary"
                  onClick={() => handleProcessPending(file.sourceFile)}
                  disabled={isLoading}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Process Pending
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => handleDownload(file.sourceFile)}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <BulkGenerateTextModal
        creators={pendingCreators}
        open={isBulkGenerateModalOpen}
        onOpenChange={setIsBulkGenerateModalOpen}
        onSuccess={handleBulkGenerateSuccess}
      />
    </div>
  );
};
