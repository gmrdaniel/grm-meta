import { Creator } from "@/types/creator";

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  hasYouTubeUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
  withoutYouTube?: boolean;
  withoutYouTubeEngagement?: boolean; // New filter for creators without YouTube engagement
}

export interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}

export interface TikTokInfoMutationParams {
  creatorId: string;
  username: string;
}
