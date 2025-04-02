import { Creator } from "@/types/creator";

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
  withoutYouTube?: boolean;
  hasYouTubeUsername?: boolean; // New filter for users with YouTube usernames
  [key: string]: boolean | undefined;
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
