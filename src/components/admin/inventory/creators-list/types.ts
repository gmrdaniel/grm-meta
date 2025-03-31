
import { Creator } from "@/types/creator";
import { CreatorFilter } from "@/components/admin/inventory/import-templates/types";

export interface CreatorsListProps {
  onCreatorSelect?: (creator: Creator) => void;
  filters?: CreatorFilter;
  onFilterChange?: (filters: CreatorFilter) => void;
}

export interface BulkActionProps {
  selectedCreators: string[];
  creators: Creator[];
  onSuccess: () => void;
  isDisabled?: boolean;
}

export interface CreatorItemProps {
  creator: Creator;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEditClick: (creator: Creator) => void;
  onTikTokInfoClick: (creatorId: string, username: string) => void;
  onTikTokVideosClick: (creatorId: string, username: string) => void;
  loadingTikTokInfo: string | null;
  loadingTikTokVideos: string | null;
  onCreatorSelect?: (creator: Creator) => void;
}

export interface FilterBarProps {
  activeFilters: CreatorFilter;
  toggleFilter: (filterName: keyof CreatorFilter) => void;
  clearFilters: () => void;
}

export interface BulkActionsBarProps {
  selectedCreators: string[];
  creators: Creator[];
  onUpdateTikTokInfo: () => void;
  onDownloadVideos: () => void;
  bulkUpdatingTikTok: boolean;
  bulkDownloadingVideos: boolean;
  bulkUpdateProgress: { current: number; total: number };
  bulkVideoProgress: { current: number; total: number };
}

export interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (value: string) => void;
}
