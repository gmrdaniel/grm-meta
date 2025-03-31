
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { 
  fetchTikTokUserInfo, 
  updateCreatorTikTokInfo, 
  fetchTikTokUserVideos 
} from "@/services/tiktokVideoService";
import { TikTokInfoMutationParams } from "./types";

interface CreatorActionsProps {
  creatorId: string;
  username?: string;
  onSuccess: () => void;
}

export function CreatorActions({ creatorId, username, onSuccess }: CreatorActionsProps) {
  const [loadingTikTokInfo, setLoadingTikTokInfo] = useState<boolean>(false);
  const [loadingTikTokVideos, setLoadingTikTokVideos] = useState<boolean>(false);

  const updateTikTokInfoMutation = useMutation({
    mutationFn: async ({ creatorId, username }: TikTokInfoMutationParams) => {
      const userInfo = await fetchTikTokUserInfo(username);
      
      console.log('Processing TikTok user info result:', userInfo);
      
      const followerCount = userInfo?.userInfo?.stats?.followerCount;
      const secUid = userInfo?.userInfo?.user?.secUid;
      
      console.log('Extracted follower count:', followerCount);
      console.log('Extracted secUid:', secUid);
      
      if (followerCount !== undefined) {
        await updateCreatorTikTokInfo(creatorId, followerCount, secUid);
        
        const isEligible = followerCount >= 100000;
        return { followerCount, isEligible, secUid };
      }
      
      throw new Error('No se pudo obtener el número de seguidores');
    },
    onSuccess: (data) => {
      const eligibilityStatus = data.isEligible ? 'elegible' : 'no elegible';
      toast.success(`Información de TikTok actualizada. Seguidores: ${data.followerCount.toLocaleString()} (${eligibilityStatus})`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error al obtener información de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokInfo(false);
    }
  });

  const fetchTikTokVideosMutation = useMutation({
    mutationFn: async ({ creatorId, username }: TikTokInfoMutationParams) => {
      const result = await fetchTikTokUserVideos(username, creatorId);
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`Se guardaron ${data.savedCount} videos de TikTok de @${variables.username} (${data.savedCount}/${data.totalCount})`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Error al obtener videos de TikTok: ${(error as Error).message}`);
    },
    onSettled: () => {
      setLoadingTikTokVideos(false);
    }
  });

  const handleFetchTikTokInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokInfo(true);
    updateTikTokInfoMutation.mutate({ creatorId, username });
  };

  const handleFetchTikTokVideos = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!username) {
      toast.error("Este creador no tiene un nombre de usuario de TikTok");
      return;
    }
    
    setLoadingTikTokVideos(true);
    fetchTikTokVideosMutation.mutate({ creatorId, username });
  };

  if (!username) return null;

  return (
    <div className="flex gap-1 ml-1">
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-6 rounded-md"
        onClick={handleFetchTikTokInfo}
        disabled={loadingTikTokInfo || loadingTikTokVideos}
      >
        {loadingTikTokInfo ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <svg 
            viewBox="0 0 24 24"
            className="h-3 w-3 mr-1"
            fill="currentColor"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        )}
        Info
      </Button>
      <Button 
        size="sm" 
        variant="secondary" 
        className="h-6 rounded-md"
        onClick={handleFetchTikTokVideos}
        disabled={loadingTikTokInfo || loadingTikTokVideos}
      >
        {loadingTikTokVideos ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Download className="h-3 w-3 mr-1" />
        )}
        Videos
      </Button>
    </div>
  );
}
