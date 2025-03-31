
import { Creator } from "@/types/creator";

export interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTiktokUsername?: boolean;
}

export interface TikTokInfoMutationParams {
  creatorId: string;
  username: string;
}
