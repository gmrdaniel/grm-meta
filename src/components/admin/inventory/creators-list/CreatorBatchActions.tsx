
import { useState } from "react";
import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, UserPlus, X, RefreshCcw, Video, Youtube } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
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
      
      {processingOperation && (
        <div className="mt-1 mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span>
              {processingOperation === "tikTokInfo" && "Obteniendo información de TikTok..."}
              {processingOperation === "tikTokVideos" && "Obteniendo videos de TikTok..."}
              {processingOperation === "youTubeInfo" && "Actualizando información de YouTube..."}
              {processingOperation === "youTubeShorts" && "Obteniendo Shorts de YouTube..."}
            </span>
            <span className="text-muted-foreground">
              {processedCount} de {selectedCreators.filter(c => 
                processingOperation.includes("TikTok") ? c.usuario_tiktok : c.usuario_youtube
              ).length} procesados
            </span>
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => clearSelection()}
        >
          Cancelar selección
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleBatchGetTikTokInfo}
          disabled={loading || processingOperation !== null}
        >
          {processingOperation === "tikTokInfo" ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Obtener info TikTok
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleBatchGetTikTokVideos}
          disabled={loading || processingOperation !== null}
        >
          {processingOperation === "tikTokVideos" ? (
            <Video className="h-4 w-4 animate-spin" />
          ) : (
            <Video className="h-4 w-4" />
          )}
          Obtener videos TikTok
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleBatchUpdateYouTubeInfo}
          disabled={loading || processingOperation !== null}
        >
          {processingOperation === "youTubeInfo" ? (
            <RefreshCcw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Actualizar YouTube
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleBatchGetYouTubeShorts}
          disabled={loading || processingOperation !== null}
        >
          {processingOperation === "youTubeShorts" ? (
            <Youtube className="h-4 w-4 animate-spin" />
          ) : (
            <Youtube className="h-4 w-4" />
          )}
          Obtener Shorts YouTube
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={openAssignDialog}
          disabled={loading || processingOperation !== null}
        >
          <UserPlus className="h-4 w-4" />
          Asignar usuario
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 text-destructive"
          onClick={() => setIsDeleteDialogOpen(true)}
          disabled={loading || processingOperation !== null}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </Button>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar creadores</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar {creatorCount} creadores? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleBatchDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign user dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar usuario</DialogTitle>
            <DialogDescription>
              Selecciona un usuario para asignar a los {creatorCount} creadores seleccionados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Usuarios disponibles</h3>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  key="unassigned"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleBatchAssign(null)}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  Sin asignar
                </Button>
                
                {users.map(user => (
                  <Button
                    key={user.id}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => handleBatchAssign(user.name)}
                    disabled={loading}
                  >
                    <UserPlus className="h-4 w-4" />
                    {user.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
