
export interface ColumnMapping {
  [key: string]: string;
}

export interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: { row: number; error: string }[];
}

export interface CreatorFilter {
  tiktokEligible?: boolean;
  hasTiktokUsername?: boolean;
  noEngagement?: boolean;
  noVideos?: boolean;
}
