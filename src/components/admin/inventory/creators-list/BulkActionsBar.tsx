
import { Button } from "@/components/ui/button";
import { CheckSquare, Download, Loader2, RefreshCw, Video } from "lucide-react";
import { BulkActionsBarProps } from "./types";

export function BulkActionsBar({
  selectedCreators,
  creators,
  onUpdateTikTokInfo,
  onDownloadVideos,
  bulkUpdatingTikTok,
  bulkDownloadingVideos,
  bulkUpdateProgress,
  bulkVideoProgress,
}: BulkActionsBarProps) {
  if (selectedCreators.length === 0) {
    return null;
  }

  return (
    <>
      <Button 
        variant="secondary"
        size="sm" 
        onClick={onUpdateTikTokInfo}
        disabled={bulkUpdatingTikTok || bulkDownloadingVideos}
        className="flex items-center gap-1"
      >
        {bulkUpdatingTikTok ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <CheckSquare className="h-4 w-4 mr-1" />
        )}
        {bulkUpdatingTikTok 
          ? `Actualizando seleccionados... ${bulkUpdateProgress.current}/${bulkUpdateProgress.total}` 
          : `Actualizar TikTok (${selectedCreators.length} seleccionados)`}
      </Button>
      
      <Button 
        variant="secondary"
        size="sm" 
        onClick={onDownloadVideos}
        disabled={bulkUpdatingTikTok || bulkDownloadingVideos}
        className="flex items-center gap-1"
      >
        {bulkDownloadingVideos ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Video className="h-4 w-4 mr-1" />
        )}
        {bulkDownloadingVideos 
          ? `Descargando videos... ${bulkVideoProgress.current}/${bulkVideoProgress.total}` 
          : `Descargar Videos (${selectedCreators.length} seleccionados)`}
      </Button>
    </>
  );
}
