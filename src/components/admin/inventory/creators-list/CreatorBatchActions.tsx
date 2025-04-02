
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { 
  fetchTikTokUserInfo, 
  updateCreatorTikTokInfo, 
  fetchTikTokUserVideos,
  sleep
} from "@/services/tiktokVideoService";
import { Creator } from "@/types/creator";

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
    
    // Process creators sequentially with delay between each to avoid rate limiting
    for (let i = 0; i < creatorsWithTikTok.length; i++) {
      const creator = creatorsWithTikTok[i];
      
      try {
        // Wait for completion before moving to next creator
        await fetchTikTokVideosMutation.mutateAsync({ 
          creatorId: creator.id, 
          username: creator.usuario_tiktok || '' 
        });
        
        // Add delay between creators to avoid rate limiting
        if (i < creatorsWithTikTok.length - 1) {
          await sleep(2500); // 2.5 second delay between creators
        }
      } catch (error) {
        console.error(`Error processing creator ${creator.usuario_tiktok}:`, error);
        // Continue with next creator even if this one fails
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
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={clearSelection}
            disabled={loadingTikTokInfo || loadingTikTokVideos}
          >
            Cancelar selección
          </Button>
          
          <Button 
            size="sm"
            variant="secondary"
            onClick={handleBatchFetchTikTokInfo}
            disabled={loadingTikTokInfo || loadingTikTokVideos}
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
            disabled={loadingTikTokInfo || loadingTikTokVideos}
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
        </div>
      </div>
    </div>
  );
}
