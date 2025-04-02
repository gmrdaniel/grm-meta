
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCcw, Youtube, Video } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { 
  fetchTikTokUserInfo, 
  updateCreatorTikTokInfo, 
  fetchTikTokUserVideos,
  sleep
} from "@/services/tiktokVideoService";
import { Creator } from "@/types/creator";
import { 
  fetchAndUpdateYouTubeInfo, 
  fetchAndSaveYouTubeShorts 
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
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<boolean>(false);
  const [loadingTikTokVideos, setLoadingTikTokVideos] = useState<boolean>(false);
  const [loadingYouTubeInfo, setLoadingYouTubeInfo] = useState<boolean>(false);
  const [loadingYouTubeShorts, setLoadingYouTubeShorts] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [totalToProcess, setTotalToProcess] = useState<number>(0);
  const [currentCreator, setCurrentCreator] = useState<string>("");

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      const userInfo = await fetchTikTokUserInfo(username);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const heartCount = userInfo?.userInfo?.stats?.heartCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      if (followerCount !== undefined) {
        let engagementRate = null;
        if (heartCount && followerCount > 0) {
          engagementRate = (heartCount / followerCount) * 100;
        }
        
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
      setCurrentCreator(username);
      const result = await fetchTikTokUserVideos(username, creatorId);
      return { ...result, username };
    },
    onSuccess: (data) => {
      setProcessedCount(prev => prev + 1);
      toast.success(`@${data.username}: ${data.savedCount} videos guardados (${data.savedCount}/${data.totalCount})`);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingTikTokVideos(false);
        setCurrentCreator("");
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
        setCurrentCreator("");
        clearSelection();
      }
    }
  });

  const updateYouTubeInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      setCurrentCreator(username);
      const result = await fetchAndUpdateYouTubeInfo(creatorId, username);
      return { ...result, username };
    },
    onSuccess: (data) => {
      setProcessedCount(prev => prev + 1);
      const eligibilityStatus = data.isEligible ? 'elegible' : 'no elegible';
      toast.success(`@${data.username}: ${data.subscriberCount.toLocaleString()} suscriptores (${eligibilityStatus})`);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingYouTubeInfo(false);
        setCurrentCreator("");
        clearSelection();
        toast.success(`Procesados datos de YouTube de ${totalToProcess} creadores correctamente`);
      }
    },
    onError: (error, variables) => {
      toast.error(`Error con YouTube de @${variables.username}: ${(error as Error).message}`);
      setProcessedCount(prev => prev + 1);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingYouTubeInfo(false);
        setCurrentCreator("");
        clearSelection();
      }
    }
  });

  const fetchYouTubeShortsMutation = useMutation({
    mutationFn: async ({ creatorId, username }: { creatorId: string; username: string }) => {
      setCurrentCreator(username);
      const result = await fetchAndSaveYouTubeShorts(creatorId, username);
      return { ...result, username };
    },
    onSuccess: (data) => {
      setProcessedCount(prev => prev + 1);
      toast.success(`@${data.username}: ${data.savedCount} shorts guardados (${data.savedCount}/${data.totalVideos})`);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingYouTubeShorts(false);
        setCurrentCreator("");
        clearSelection();
        toast.success(`Procesados shorts de YouTube de ${totalToProcess} creadores correctamente`);
      }
    },
    onError: (error, variables) => {
      toast.error(`Error con shorts de YouTube de @${variables.username}: ${(error as Error).message}`);
      setProcessedCount(prev => prev + 1);
      
      if (processedCount + 1 === totalToProcess) {
        onSuccess();
        setLoadingYouTubeShorts(false);
        setCurrentCreator("");
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

  const handleBatchFetchTikTokVideos = async () => {
    const creatorsWithTikTok = selectedCreators.filter(creator => creator.usuario_tiktok);
    
    if (creatorsWithTikTok.length === 0) {
      toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokVideos(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithTikTok.length);
    
    for (let i = 0; i < creatorsWithTikTok.length; i++) {
      const creator = creatorsWithTikTok[i];
      
      try {
        await fetchTikTokVideosMutation.mutateAsync({ 
          creatorId: creator.id, 
          username: creator.usuario_tiktok || '' 
        });
        
        if (i < creatorsWithTikTok.length - 1) {
          await sleep(2500);
        }
      } catch (error) {
        console.error(`Error processing creator ${creator.usuario_tiktok}:`, error);
        setProcessedCount(prev => prev + 1);
      }
    }
  };

  const handleBatchFetchYouTubeInfo = async () => {
    const creatorsWithYouTube = selectedCreators.filter(creator => creator.usuario_youtube);
    
    if (creatorsWithYouTube.length === 0) {
      toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de YouTube");
      return;
    }
    
    setLoadingYouTubeInfo(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithYouTube.length);
    
    for (let i = 0; i < creatorsWithYouTube.length; i++) {
      const creator = creatorsWithYouTube[i];
      
      try {
        await updateYouTubeInfoMutation.mutateAsync({ 
          creatorId: creator.id, 
          username: creator.usuario_youtube || '' 
        });
        
        if (i < creatorsWithYouTube.length - 1) {
          await sleep(1500);
        }
      } catch (error) {
        console.error(`Error processing creator ${creator.usuario_youtube}:`, error);
        setProcessedCount(prev => prev + 1);
      }
    }
  };

  const handleBatchFetchYouTubeShorts = async () => {
    const creatorsWithYouTube = selectedCreators.filter(creator => creator.usuario_youtube);
    
    if (creatorsWithYouTube.length === 0) {
      toast.error("Ninguno de los creadores seleccionados tiene un nombre de usuario de YouTube");
      return;
    }
    
    setLoadingYouTubeShorts(true);
    setProcessedCount(0);
    setTotalToProcess(creatorsWithYouTube.length);
    
    for (let i = 0; i < creatorsWithYouTube.length; i++) {
      const creator = creatorsWithYouTube[i];
      
      try {
        await fetchYouTubeShortsMutation.mutateAsync({ 
          creatorId: creator.id, 
          username: creator.usuario_youtube || '' 
        });
        
        if (i < creatorsWithYouTube.length - 1) {
          await sleep(2000);
        }
      } catch (error) {
        console.error(`Error processing creator ${creator.usuario_youtube}:`, error);
        setProcessedCount(prev => prev + 1);
      }
    }
  };

  if (selectedCreators.length === 0) return null;

  return (
    <div className="bg-slate-50 p-3 rounded-md border mt-4 mb-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-medium text-sm">
            {selectedCreators.length} creadores seleccionados
          </h3>
          <p className="text-xs text-muted-foreground">
            Ejecuta acciones en lote para todos los seleccionados
          </p>
          {currentCreator && (
            <p className="text-xs font-medium text-blue-600 mt-1">
              Procesando actualmente: @{currentCreator}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={clearSelection}
            disabled={loadingTikTokInfo || loadingTikTokVideos || loadingYouTubeInfo || loadingYouTubeShorts}
          >
            Cancelar selección
          </Button>
          
          <Button 
            size="sm"
            variant="secondary"
            onClick={handleBatchFetchTikTokInfo}
            disabled={loadingTikTokInfo || loadingTikTokVideos || loadingYouTubeInfo || loadingYouTubeShorts}
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
            disabled={loadingTikTokInfo || loadingTikTokVideos || loadingYouTubeInfo || loadingYouTubeShorts}
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
          
          <Button 
            size="sm"
            variant="secondary"
            onClick={handleBatchFetchYouTubeInfo}
            disabled={loadingTikTokInfo || loadingTikTokVideos || loadingYouTubeInfo || loadingYouTubeShorts}
            className="flex items-center gap-1"
          >
            {loadingYouTubeInfo ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Procesando ({processedCount}/{totalToProcess})
              </>
            ) : (
              <>
                <Youtube className="h-3 w-3 mr-1" />
                Actualizar YouTube
              </>
            )}
          </Button>
          
          <Button 
            size="sm"
            variant="secondary"
            onClick={handleBatchFetchYouTubeShorts}
            disabled={loadingTikTokInfo || loadingTikTokVideos || loadingYouTubeInfo || loadingYouTubeShorts}
            className="flex items-center gap-1"
          >
            {loadingYouTubeShorts ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Procesando Shorts ({processedCount}/{totalToProcess})
              </>
            ) : (
              <>
                <Video className="h-3 w-3 mr-1" />
                Obtener Shorts YouTube
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
