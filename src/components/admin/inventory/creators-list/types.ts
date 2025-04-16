
import { Creator } from "@/types/creator";

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  hasYouTubeUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
  withVideos?: boolean;
  withoutYouTube?: boolean;
  withoutYouTubeEngagement?: boolean;
  assignedToUser?: string;
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

export interface AssignUserParams {
  creatorId: string;
  userId: string | null;
}
