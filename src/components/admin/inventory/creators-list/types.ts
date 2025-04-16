
export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTikTokUsername?: boolean;
  hasYouTubeUsername?: boolean;
  withoutEngagement?: boolean;
  withoutVideos?: boolean;
  withVideos?: boolean;
  withoutYouTube?: boolean;
  withoutYouTubeEngagement?: boolean;
}

export interface CreatorsListProps {
  onCreatorSelect?: (creator: any) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}
