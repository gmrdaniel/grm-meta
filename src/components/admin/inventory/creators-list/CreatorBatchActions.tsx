
import { useState } from "react";
import { Creator } from "@/types/creator";
import { toast } from "sonner";
import { 
  fetchAdminUsers, 
  batchAssignCreatorsToUser 
} from "@/services/creatorService";
import { 
  batchUpdateTikTokInfo, 
  batchFetchTikTokVideos 
} from "@/services/tiktokVideoService";
import { 
  batchUpdateYouTubeInfo, 
  batchFetchYouTubeShorts 
} from "@/services/youtubeService";
import { BatchProcessingProgress } from "./BatchProcessingProgress";
import { BatchActionButtons } from "./BatchActionButtons";
import { DeleteCreatorsDialog } from "./dialogs/DeleteCreatorsDialog";
import { AssignUserDialog } from "./dialogs/AssignUserDialog";

interface CreatorBatchActionsProps {
  selectedCreators: Creator[];
  onSuccess: () => void;
  clearSelection: () => void;
}

export function CreatorBatchActions({ 
  selectedCreators, 
  onSuccess, 
  clearSelection 
}: CreatorBatchActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingOperation, setProcessingOperation] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  
  const creatorCount = selectedCreators.length;

  if (creatorCount === 0) {
    return null;
  }

  const handleBatchDelete = async () => {
    // Implementation for batch deletion would go here
    toast.success(`${creatorCount} creadores eliminados`);
    onSuccess();
    clearSelection();
    setIsDeleteDialogOpen(false);
  };

  const openAssignDialog = async () => {
    try {
      setLoading(true);
      const adminUsers = await fetchAdminUsers();
      setUsers(adminUsers);
      setIsAssignDialogOpen(true);
    } catch (error) {
      console.error("Error loading admin users:", error);
      toast.error("Error al cargar los usuarios administradores");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAssign = async (userName: string | null) => {
    try {
      setLoading(true);
      const creatorIds = selectedCreators.map(creator => creator.id);
      await batchAssignCreatorsToUser(creatorIds, userName);
      
      toast.success(
        userName 
          ? `${creatorCount} creadores asignados a ${userName}` 
          : `Se eliminó la asignación de ${creatorCount} creadores`
      );
      
      onSuccess();
      clearSelection();
      setIsAssignDialogOpen(false);
    } catch (error) {
      console.error("Error assigning creators:", error);
      toast.error("Error al asignar creadores");
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = (processed: number, total: number) => {
    const percentage = Math.floor((processed / total) * 100);
    setProgress(percentage);
    setProcessedCount(processed);
  };

  const handleBatchGetTikTokInfo = async () => {
    try {
      setProcessingOperation("tikTokInfo");
      setProgress(0);
      setProcessedCount(0);
      
      // Filter creators that have TikTok usernames
      const creatorsWithTikTok = selectedCreators.filter(c => c.usuario_tiktok);
      
      if (creatorsWithTikTok.length === 0) {
        toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de TikTok");
        return;
      }
      
      toast.info(`Obteniendo información de TikTok para ${creatorsWithTikTok.length} creadores...`);
      
      const result = await batchUpdateTikTokInfo(
        creatorsWithTikTok, 
        (processed, total) => updateProgress(processed, total)
      );
      
      toast.success(`Información de TikTok actualizada para ${result.successful} de ${result.totalProcessed} creadores`);
      onSuccess();
    } catch (error) {
      console.error("Error updating TikTok info:", error);
      toast.error("Error al obtener información de TikTok");
    } finally {
      setProcessingOperation(null);
      setProgress(0);
      setProcessedCount(0);
    }
  };

  const handleBatchGetTikTokVideos = async () => {
    try {
      setProcessingOperation("tikTokVideos");
      setProgress(0);
      setProcessedCount(0);
      
      // Filter creators that have TikTok usernames
      const creatorsWithTikTok = selectedCreators.filter(c => c.usuario_tiktok);
      
      if (creatorsWithTikTok.length === 0) {
        toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de TikTok");
        return;
      }
      
      toast.info(`Obteniendo videos de TikTok para ${creatorsWithTikTok.length} creadores...`);
      
      const result = await batchFetchTikTokVideos(
        creatorsWithTikTok,
        (processed, total) => updateProgress(processed, total)
      );
      
      toast.success(`Videos de TikTok obtenidos para ${result.successful} de ${result.totalProcessed} creadores`);
      onSuccess();
    } catch (error) {
      console.error("Error fetching TikTok videos:", error);
      toast.error("Error al obtener videos de TikTok");
    } finally {
      setProcessingOperation(null);
      setProgress(0);
      setProcessedCount(0);
    }
  };

  const handleBatchUpdateYouTubeInfo = async () => {
    try {
      setProcessingOperation("youTubeInfo");
      setProgress(0);
      setProcessedCount(0);
      
      // Filter creators that have YouTube usernames
      const creatorsWithYouTube = selectedCreators.filter(c => c.usuario_youtube);
      
      if (creatorsWithYouTube.length === 0) {
        toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de YouTube");
        return;
      }
      
      toast.info(`Actualizando información de YouTube para ${creatorsWithYouTube.length} creadores...`);
      
      const result = await batchUpdateYouTubeInfo(
        creatorsWithYouTube,
        (processed, total) => updateProgress(processed, total)
      );
      
      toast.success(`Información de YouTube actualizada para ${result.successful} de ${result.totalProcessed} creadores`);
      onSuccess();
    } catch (error) {
      console.error("Error updating YouTube info:", error);
      toast.error("Error al actualizar información de YouTube");
    } finally {
      setProcessingOperation(null);
      setProgress(0);
      setProcessedCount(0);
    }
  };

  const handleBatchGetYouTubeShorts = async () => {
    try {
      setProcessingOperation("youTubeShorts");
      setProgress(0);
      setProcessedCount(0);
      
      // Filter creators that have YouTube usernames
      const creatorsWithYouTube = selectedCreators.filter(c => c.usuario_youtube);
      
      if (creatorsWithYouTube.length === 0) {
        toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de YouTube");
        return;
      }
      
      toast.info(`Obteniendo Shorts de YouTube para ${creatorsWithYouTube.length} creadores...`);
      
      const result = await batchFetchYouTubeShorts(
        creatorsWithYouTube,
        (processed, total) => updateProgress(processed, total)
      );
      
      toast.success(`Shorts de YouTube obtenidos para ${result.successful} de ${result.totalProcessed} creadores`);
      onSuccess();
    } catch (error) {
      console.error("Error fetching YouTube shorts:", error);
      toast.error("Error al obtener Shorts de YouTube");
    } finally {
      setProcessingOperation(null);
      setProgress(0);
      setProcessedCount(0);
    }
  };

  return (
    <div className="flex flex-col gap-2 my-4 p-2 bg-muted/50 rounded-md">
      <div className="flex items-center">
        <span className="text-sm font-medium mr-2">
          {creatorCount} creadores seleccionados
        </span>
        <span className="text-xs text-muted-foreground">
          Ejecuta acciones en lote para todos los seleccionados
        </span>
      </div>
      
      <BatchProcessingProgress
        operationType={processingOperation}
        progress={progress}
        processedCount={processedCount}
        totalCount={selectedCreators.filter(c => 
          processingOperation?.includes("TikTok") ? c.usuario_tiktok : c.usuario_youtube
        ).length}
      />
      
      <BatchActionButtons
        loading={loading}
        processingOperation={processingOperation}
        onGetTikTokInfo={handleBatchGetTikTokInfo}
        onGetTikTokVideos={handleBatchGetTikTokVideos}
        onUpdateYouTubeInfo={handleBatchUpdateYouTubeInfo}
        onGetYouTubeShorts={handleBatchGetYouTubeShorts}
        onOpenAssignDialog={openAssignDialog}
        onOpenDeleteDialog={() => setIsDeleteDialogOpen(true)}
        onClearSelection={clearSelection}
      />
      
      <DeleteCreatorsDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleBatchDelete}
        creatorCount={creatorCount}
      />
      
      <AssignUserDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onAssign={handleBatchAssign}
        users={users}
        creatorCount={creatorCount}
        loading={loading}
      />
    </div>
  );
}
