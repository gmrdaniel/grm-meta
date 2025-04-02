
import { ExternalLink, Users, Youtube } from "lucide-react";
import { CreatorActions } from "./CreatorActions";
import { formatFollowers, formatEngagement } from "./utils";
import { Button } from "@/components/ui/button";
import { fetchYouTubeChannelInfo } from "@/services/youtubeService";

interface SocialNetworksProps {
  usuario_tiktok?: string;
  seguidores_tiktok?: number;
  elegible_tiktok?: boolean;
  engagement_tiktok?: number;
  usuario_youtube?: string;
  seguidores_youtube?: number;
  elegible_youtube?: boolean;
  engagement_youtube?: number;
  usuario_pinterest?: string;
  seguidores_pinterest?: number;
  page_facebook?: string;
  creatorId: string;
  onRefetch: () => void;
}

export function SocialNetworks({
  usuario_tiktok,
  seguidores_tiktok,
  elegible_tiktok,
  engagement_tiktok,
  usuario_youtube,
  seguidores_youtube,
  elegible_youtube,
  engagement_youtube,
  usuario_pinterest,
  seguidores_pinterest,
  page_facebook,
  creatorId,
  onRefetch
}: SocialNetworksProps) {
  const hasSocialNetworks = !!(usuario_tiktok || usuario_pinterest || usuario_youtube || page_facebook);

  if (!hasSocialNetworks) {
    return <span className="text-sm text-gray-500">Sin redes sociales</span>;
  }

  const handleYouTubeInfo = async (channelId: string) => {
    try {
      const channelInfo = await fetchYouTubeChannelInfo(channelId);
      console.log('YouTube channel info:', channelInfo);
    } catch (error) {
      console.error('Error fetching YouTube channel info:', error);
    }
  };

  return (
    <div className="space-y-1">
      {usuario_tiktok && (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium">TikTok:</span> 
            <a href={`https://tiktok.com/@${usuario_tiktok}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline">
              @{usuario_tiktok}
              <ExternalLink className="h-3 w-3" />
            </a>
            {seguidores_tiktok && (
              <span className="ml-2 flex items-center text-gray-500 text-xs">
                <Users className="h-3 w-3 mr-1" /> {formatFollowers(seguidores_tiktok)}
              </span>
            )}
            <CreatorActions 
              creatorId={creatorId} 
              username={usuario_tiktok} 
              onSuccess={onRefetch}
            />
          </div>
          <div className="flex gap-3 mt-1 text-xs">
            <span className={`flex items-center ${elegible_tiktok ? 'text-green-500' : 'text-gray-400'}`}>
              {elegible_tiktok ? 'Elegible' : 'No elegible'}
            </span>
            {engagement_tiktok && (
              <span className="flex items-center text-gray-500">
                Engagement: {formatEngagement(engagement_tiktok)}
              </span>
            )}
          </div>
        </div>
      )}
      
      {usuario_youtube && (
        <div className="text-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium">YouTube:</span> 
            <a href={`https://youtube.com/channel/${usuario_youtube}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline">
              {usuario_youtube}
              <ExternalLink className="h-3 w-3" />
            </a>
            {seguidores_youtube && (
              <span className="ml-2 flex items-center text-gray-500 text-xs">
                <Users className="h-3 w-3 mr-1" /> {formatFollowers(seguidores_youtube)}
              </span>
            )}
            <Button 
              size="sm" 
              variant="secondary" 
              className="h-6 rounded-md ml-2 flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                handleYouTubeInfo(usuario_youtube);
              }}
            >
              <Youtube className="h-3 w-3" />
              YouTube
            </Button>
          </div>
          <div className="flex gap-3 mt-1 text-xs">
            <span className={`flex items-center ${elegible_youtube ? 'text-green-500' : 'text-gray-400'}`}>
              {elegible_youtube ? 'Elegible' : 'No elegible'}
            </span>
            {engagement_youtube && (
              <span className="flex items-center text-gray-500">
                Engagement: {formatEngagement(engagement_youtube)}
              </span>
            )}
          </div>
        </div>
      )}
      
      {usuario_pinterest && (
        <div className="text-sm flex items-center gap-1">
          <span className="font-medium">Pinterest:</span> 
          <a href={`https://pinterest.com/${usuario_pinterest}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline">
            @{usuario_pinterest}
            <ExternalLink className="h-3 w-3" />
          </a>
          {seguidores_pinterest && (
            <span className="ml-2 flex items-center text-gray-500 text-xs">
              <Users className="h-3 w-3 mr-1" /> {formatFollowers(seguidores_pinterest)}
            </span>
          )}
        </div>
      )}
      
      {page_facebook && (
        <div className="text-sm flex items-center gap-1">
          <span className="font-medium">Facebook:</span> 
          <a href={page_facebook} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline">
            Página
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
