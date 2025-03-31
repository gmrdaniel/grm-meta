
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Download } from "lucide-react";
import { fetchTikTokUserInfo, updateCreatorTikTokInfo, fetchTikTokUserVideos } from "@/services/tiktokVideoService";
import { fetchCreators } from "@/services/creatorService";
import { BulkActionProps } from "./types";

export function BulkUpdateTikTokInfoButton({ 
  selectedCreators, 
  creators, 
  onSuccess 
}: BulkActionProps) {
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const updateAllTikTokCreators = async () => {
    try {
      setBulkUpdating(true);
      
      const allCreatorsResponse = await fetchCreators(1, 1000, { hasTiktokUsername: true });
      const creatorsWithTikTok = allCreatorsResponse.data.filter(creator => creator.usuario_tiktok);
      
      if (creatorsWithTikTok.length === 0) {
        toast.info("No se encontraron creadores con nombre de usuario de TikTok");
        setBulkUpdating(false);
        return;
      }
      
      setProgress({current: 0, total: creatorsWithTikTok.length});
      
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < creatorsWithTikTok.length; i++) {
        const creator = creatorsWithTikTok[i];
        setProgress({current: i + 1, total: creatorsWithTikTok.length});
        
        if (creator.usuario_tiktok) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const userInfo = await fetchTikTokUserInfo(creator.usuario_tiktok);
            
            const followerCount = userInfo?.userInfo?.stats?.followerCount;
            const heartCount = userInfo?.userInfo?.stats?.heartCount;
            const secUid = userInfo?.userInfo?.user?.secUid;
            
            let engagementRate: number | undefined = undefined;
            
            if (followerCount && heartCount && followerCount > 0) {
              engagementRate = (heartCount / followerCount) * 100;
            }
            
            if (followerCount !== undefined) {
              await updateCreatorTikTokInfo(creator.id, followerCount, engagementRate, secUid);
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            console.error(`Error actualizando creador ${creator.nombre} ${creator.apellido}:`, err);
            failCount++;
          }
        }
      }
      
      toast.success(`Actualización masiva completada: ${successCount} creadores actualizados, ${failCount} fallidos`);
      onSuccess();
    } catch (error) {
      console.error("Error en actualización masiva:", error);
      toast.error(`Error en actualización masiva: ${(error as Error).message}`);
    } finally {
      setBulkUpdating(false);
      setProgress({current: 0, total: 0});
    }
  };

  return (
    <Button 
      variant="secondary"
      size="sm" 
      onClick={updateAllTikTokCreators} 
      disabled={bulkUpdating}
      className="flex items-center gap-1"
    >
      {bulkUpdating ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-1" />
      )}
      {bulkUpdating 
        ? `Actualizando... ${progress.current}/${progress.total}` 
        : "Actualizar todos los perfiles TikTok"}
    </Button>
  );
}

export function BulkDownloadTikTokVideosButton({ 
  selectedCreators, 
  creators, 
  onSuccess 
}: BulkActionProps) {
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const downloadAllTikTokVideos = async () => {
    try {
      setBulkDownloading(true);
      
      const allCreatorsResponse = await fetchCreators(1, 1000, { hasTiktokUsername: true });
      const creatorsWithTikTok = allCreatorsResponse.data.filter(creator => creator.usuario_tiktok);
      
      if (creatorsWithTikTok.length === 0) {
        toast.info("No se encontraron creadores con nombre de usuario de TikTok");
        setBulkDownloading(false);
        return;
      }
      
      setProgress({current: 0, total: creatorsWithTikTok.length});
      
      let successCount = 0;
      let failCount = 0;
      let totalVideos = 0;
      
      for (let i = 0; i < creatorsWithTikTok.length; i++) {
        const creator = creatorsWithTikTok[i];
        setProgress({current: i + 1, total: creatorsWithTikTok.length});
        
        if (creator.usuario_tiktok) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const result = await fetchTikTokUserVideos(creator.usuario_tiktok, creator.id);
            totalVideos += result.savedCount;
            successCount++;
          } catch (err) {
            console.error(`Error descargando videos para ${creator.nombre} ${creator.apellido}:`, err);
            failCount++;
          }
        }
      }
      
      toast.success(`Descarga masiva completada: ${successCount} creadores procesados, ${totalVideos} videos guardados, ${failCount} errores`);
      onSuccess();
    } catch (error) {
      console.error("Error en descarga masiva:", error);
      toast.error(`Error en descarga masiva: ${(error as Error).message}`);
    } finally {
      setBulkDownloading(false);
      setProgress({current: 0, total: 0});
    }
  };

  return (
    <Button 
      variant="secondary"
      size="sm" 
      onClick={downloadAllTikTokVideos} 
      disabled={bulkDownloading}
      className="flex items-center gap-1"
    >
      {bulkDownloading ? (
        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-1" />
      )}
      {bulkDownloading 
        ? `Descargando... ${progress.current}/${progress.total}` 
        : "Descargar todos los videos TikTok"}
    </Button>
  );
}
