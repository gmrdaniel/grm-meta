
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DownloadTemplateButton } from "./bulk-invite/DownloadTemplateButton";
import { FileUploadButton } from "./bulk-invite/FileUploadButton";
import { ProcessingStatus } from "./bulk-invite/ProcessingStatus";
import { CreatorsTable } from "./bulk-invite/CreatorsTable";
import { processExcelFile, createInvitation, getDefaultService } from "./bulk-invite/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
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
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        // Cargar servicios
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .order('name');

        if (servicesError) throw servicesError;
        
        // Asegurarnos de que los tipos sean válidos
        const validServices = servicesData?.map(service => ({
          ...service,
          type: service.type as 'único' | 'recurrente' | 'contrato'
        })) || [];

        setServices(validServices);

        // Obtener el servicio por defecto
        const defaultService = await getDefaultService();
        if (defaultService) {
          setSelectedServiceId(defaultService.id);
        }
      } catch (error) {
        console.error('Error loading services:', error);
        toast.error('Error al cargar los servicios');
      }
    };

    loadServices();
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-72">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Servicio
            </label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
