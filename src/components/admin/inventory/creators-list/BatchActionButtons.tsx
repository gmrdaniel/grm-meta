
import { Button } from "@/components/ui/button";
import { RefreshCcw, Video, Youtube, UserPlus, Trash2 } from "lucide-react";

interface BatchActionButtonsProps {
  loading: boolean;
  processingOperation: string | null;
  onGetTikTokInfo: () => void;
  onGetTikTokVideos: () => void;
  onUpdateYouTubeInfo: () => void;
  onGetYouTubeShorts: () => void;
  onOpenAssignDialog: () => void;
  onOpenDeleteDialog: () => void;
  onClearSelection: () => void;
}

export function BatchActionButtons({
  loading,
  processingOperation,
  onGetTikTokInfo,
  onGetTikTokVideos,
  onUpdateYouTubeInfo,
  onGetYouTubeShorts,
  onOpenAssignDialog,
  onOpenDeleteDialog,
  onClearSelection
}: BatchActionButtonsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearSelection}
      >
        Cancelar selección
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={onGetTikTokInfo}
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
        onClick={onGetTikTokVideos}
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
        onClick={onUpdateYouTubeInfo}
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
        onClick={onGetYouTubeShorts}
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
        onClick={onOpenAssignDialog}
        disabled={loading || processingOperation !== null}
      >
        <UserPlus className="h-4 w-4" />
        Asignar usuario
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 text-destructive"
        onClick={onOpenDeleteDialog}
        disabled={loading || processingOperation !== null}
      >
        <Trash2 className="h-4 w-4" />
        Eliminar
      </Button>
    </div>
  );
}
