
import { Creator } from "@/types/creator";

export interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
}

export interface TikTokInfoMutationParams {
  creatorId: string;
  username: string;
}
