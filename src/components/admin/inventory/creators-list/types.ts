
import { Creator } from "@/types/creator";

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
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

export interface CreatorBatchActionsProps {
  selectedCreators: Creator[];
  onSuccess: () => void;
  clearSelection: () => void;
  allCreators?: Creator[];
}
