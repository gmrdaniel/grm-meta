
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCcw, Video } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { 
  fetchTikTokUserInfo, 
  updateCreatorTikTokInfo, 
  fetchTikTokUserVideos 
} from "@/services/tiktokVideoService";
import { Creator } from "@/types/creator";

interface CreatorBatchActionsProps {
  selectedCreators: Creator[];
  onSuccess: () => void;
  clearSelection: () => void;
  allCreators?: Creator[];
}

export function CreatorBatchActions({ 
  selectedCreators, 
  onSuccess,
  clearSelection,
  allCreators = [] 
}: CreatorBatchActionsProps) {
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<boolean>(false);
  const [loadingTikTokVideos, setLoadingTikTokVideos] = useState<boolean>(false);
  const [loadingAllVideos, setLoadingAllVideos] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const userInfo = await fetchTikTokUserInfo(username);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const heartCount = userInfo?.userInfo?.stats?.heartCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      if (followerCount !== undefined) {
        // Calculate engagement rate as heart count / follower count * 100 (to get percentage)
        let engagementRate = null;
        if (heartCount && followerCount > 0) {
          engagementRate = (heartCount / followerCount) * 100;
        }
        
        // Update creator with follower count, secUid, and engagement rate
        await updateCreatorTikTokInfo(creatorId, followerCount, secUid, engagementRate);
        
        const isEligible = followerCount >= 100000;
        return { 
          followerCount, 
          isEligible, 
          secUid,
          engagementRate,
          username
        };
      }
      
      throw new Error(`No se pudo obtener el número de seguidores para @${username}`);
    },
    onSuccess: (data) => {
      setProcessedCount(prev => prev + 1);
      const eligibilityStatus = data.isEligible ? 'elegible' : 'no elegible';
      toast.success(`@${data.username}: ${data.followerCount.toLocaleString()} seguidores (${eligibilityStatus}), Engagement: ${data.engagementRate ? data.engagementRate.toFixed(2) + '%' : 'N/A'}`);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingTikTokInfo(false);
        clearSelection();
        toast.success(`Procesados ${totalToProcess} creadores correctamente`);
      }
    },
    onError: (error, variables) => {
      toast.error(`Error con @${variables.username}: ${(error as Error).message}`);
      setProcessedCount(prev => prev + 1);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingTikTokInfo(false);
        clearSelection();
      }
    }
  });

  const fetchTikTokVideosMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const result = await fetchTikTokUserVideos(username, creatorId);
      return { ...result, username };
    },
    onSuccess: (data) => {
      setProcessedCount(prev => prev + 1);
      toast.success(`@${data.username}: ${data.savedCount} videos guardados (${data.savedCount}/${data.totalCount})`);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingTikTokVideos(false);
        clearSelection();
        toast.success(`Procesados videos de ${totalToProcess} creadores correctamente`);
      }
    },
    onError: (error, variables) => {
      toast.error(`Error con videos de @${variables.username}: ${(error as Error).message}`);
      setProcessedCount(prev => prev + 1);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingTikTokVideos(false);
        clearSelection();
      }
    }
  });

  const handleBatchFetchTikTokInfo = () => {
    const creatorsWithTikTok = selectedCreators.filter(creator => creator.usuario_tiktok);
    
    if (creatorsWithTikTok.length === 0) {
      toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokInfo(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithTikTok.length);
    
    for (const creator of creatorsWithTikTok) {
      updateTikTokInfoMutation.mutate({ 
        creatorId: creator.id, 
        username: creator.usuario_tiktok || '' 
      });
    }
  };

  const handleBatchFetchTikTokVideos = () => {
    const creatorsWithTikTok = selectedCreators.filter(creator => creator.usuario_tiktok);
    
    if (creatorsWithTikTok.length === 0) {
      toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokVideos(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithTikTok.length);
    
    for (const creator of creatorsWithTikTok) {
      fetchTikTokVideosMutation.mutate({ 
        creatorId: creator.id, 
        username: creator.usuario_tiktok || '' 
      });
    }
  };

  // New function to process all creators' videos with delay
  const handleFetchAllTikTokVideos = async () => {
    const creatorsWithTikTok = allCreators.filter(creator => creator.usuario_tiktok);
    
    if (creatorsWithTikTok.length === 0) {
      toast.error("Ninguno de los creadores tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingAllVideos(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithTikTok.length);
    
    // Process creators sequentially with delay
    for (let i = 0; i < creatorsWithTikTok.length; i++) {
      const creator = creatorsWithTikTok[i];
      try {
        const result = await fetchTikTokUserVideos(creator.usuario_tiktok || '', creator.id);
        toast.success(`@${creator.usuario_tiktok}: ${result.savedCount} videos guardados (${result.savedCount}/${result.totalCount})`);
      } catch (error) {
        toast.error(`Error con videos de @${creator.usuario_tiktok}: ${(error as Error).message}`);
      }
        await sleep(1000);
      
      // Update processed count
      setProcessedCount(i + 1);
      
      // Wait 1 second before processing the next creator
      if (i < creatorsWithTikTok.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    toast.success(`Procesados videos de ${creatorsWithTikTok.length} creadores correctamente`);
    onSuccess();
    setLoadingAllVideos(false);
  };

  // Show fetch all videos button even if no creators are selected
  const showFetchAllVideosButton = Array.isArray(allCreators) && allCreators.length > 0;

  return (
    <div className="bg-slate-50 p-3 rounded-md border mt-4 mb-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-sm">
            {selectedCreators.length > 0 ? `${selectedCreators.length} creadores seleccionados` : 'Acciones en lote'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {selectedCreators.length > 0 
              ? 'Ejecuta acciones en lote para todos los seleccionados' 
              : 'Ejecuta acciones en lote para todos los creadores'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {selectedCreators.length > 0 && (
            <>
              <Button 
                size="sm"
                variant="outline"
                onClick={clearSelection}
                disabled={loadingTikTokInfo || loadingTikTokVideos || loadingAllVideos}
              >
                Cancelar selección
              </Button>
              
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleBatchFetchTikTokInfo}
                disabled={loadingTikTokInfo || loadingTikTokVideos || loadingAllVideos}
                className="flex items-center gap-1"
              >
                {loadingTikTokInfo ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Procesando ({processedCount}/{totalToProcess})
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-3 w-3 mr-1" />
                    Obtener info TikTok
                  </>
                )}
              </Button>
              
              <Button 
                size="sm"
                variant="secondary"
                onClick={handleBatchFetchTikTokVideos}
                disabled={loadingTikTokInfo || loadingTikTokVideos || loadingAllVideos}
                className="flex items-center gap-1"
              >
                {loadingTikTokVideos ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Procesando ({processedCount}/{totalToProcess})
                  </>
                ) : (
                  <>
                    <Download className="h-3 w-3 mr-1" />
                    Obtener videos TikTok
                  </>
                )}
              </Button>
            </>
          )}
          
          {showFetchAllVideosButton && (
            <Button 
              size="sm"
              variant="default"
              onClick={handleFetchAllTikTokVideos}
              disabled={loadingTikTokInfo || loadingTikTokVideos || loadingAllVideos}
              className="flex items-center gap-1"
            >
              {loadingAllVideos ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Procesando videos ({processedCount}/{totalToProcess})
                </>
              ) : (
                <>
                  <Video className="h-3 w-3 mr-1" />
                  Obtener videos de todos los creadores
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
