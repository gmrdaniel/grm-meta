
import { useState } from "react";
import { toast } from "sonner";
import { DownloadTemplateButton } from "./bulk-invite/DownloadTemplateButton";
import { FileUploadButton } from "./bulk-invite/FileUploadButton";
import { ProcessingStatus } from "./bulk-invite/ProcessingStatus";
import { CreatorsTable } from "./bulk-invite/CreatorsTable";
import { processExcelFile, createInvitation } from "./bulk-invite/utils";

interface InvitationDetail {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  status: string;
  invitation_link?: string;
}

export function BulkInviteCreators() {
  const [isUploading, setIsUploading] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<InvitationDetail[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setProcessingStatus("Iniciando procesamiento del archivo...");

    try {
      const processedRows = await processExcelFile(file);
      
      const processedDetails: InvitationDetail[] = [];
      let processedCount = 0;

      for (const detail of processedRows) {
        processedCount++;
        setProcessingStatus(`Procesando invitación ${processedCount} de ${processedRows.length}...`);
        
        const processedDetail = await createInvitation(detail);
        processedDetails.push(processedDetail);
      }

      setInvitationDetails(processedDetails);
      setProcessingStatus("");
      toast.success(`Archivo procesado: ${processedDetails.length} registros válidos`);
    } catch (error: any) {
      setError(error.message || "Error al procesar el archivo");
      toast.error("Error al procesar el archivo");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <DownloadTemplateButton />
        </div>

        <FileUploadButton
          isUploading={isUploading}
          onFileSelect={handleFileUpload}
        />

        <ProcessingStatus
          status={processingStatus}
          error={error}
        />
      </div>

      <CreatorsTable invitationDetails={invitationDetails} />
    </div>
  );
}
