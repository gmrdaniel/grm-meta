import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadTemplateButton } from "./bulk-invite/DownloadTemplateButton";
import { FileUploadButton } from "./bulk-invite/FileUploadButton";
import { ProcessingStatus } from "./bulk-invite/ProcessingStatus";
import { CreatorsTable } from "./bulk-invite/CreatorsTable";
import { processExcelFile, createInvitation, getDefaultService } from "./bulk-invite/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServices } from "@/hooks/useServices";
import { Service } from "@/types/services";
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
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const {
    data: services = [],
    isLoading: isLoadingServices
  } = useServices();
  useEffect(() => {
    const setDefaultService = async () => {
      try {
        const defaultService = await getDefaultService();
        if (defaultService) {
          setSelectedServiceId(defaultService.id);
        }
      } catch (error) {
        console.error('Error setting default service:', error);
        toast.error('Error al establecer el servicio por defecto');
      }
    };
    setDefaultService();
  }, []);
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!selectedServiceId) {
      setError("Por favor seleccione un servicio antes de subir el archivo");
      toast.error("Seleccione un servicio");
      return;
    }
    setIsUploading(true);
    setError(null);
    setProcessingStatus("Iniciando procesamiento del archivo...");
    try {
      const processedRows = await processExcelFile(file, selectedServiceId);
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
  return <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <DownloadTemplateButton />

        <div className="flex items-center gap-4">
          <div className="w-72">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Servicio
            </label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={isLoadingServices}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <p>Selecciona un servicio</p>
            {isLoadingServices && <p className="text-sm text-gray-500 mt-1">Cargando servicios...</p>}
          </div>

          <FileUploadButton isUploading={isUploading} onFileSelect={handleFileUpload} />
        </div>

        <ProcessingStatus status={processingStatus} error={error} />
      </div>

      <CreatorsTable invitationDetails={invitationDetails} />
    </div>;
}
