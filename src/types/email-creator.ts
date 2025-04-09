
export interface EmailCreator {
  id: string;
  full_name: string;
  email: string;
  tiktok_link: string;
  link_invitation?: string | null;
  created_at: string;
  prompt?: string;
  prompt_output?: string;
  status: 'active' | 'inactive' | 'completed';
  source_file?: string | null;
  updated_at: string;
}

export type EmailCreatorImportRow = {
  full_name: string;
  email: string;
  tiktok_link: string;
  link_invitation?: string;
};

export type EmailCreatorImportResult = {
  successful: number;
  failed: number;
  errors: { row: number; message: string }[];
};

export interface PaginationParams {
  page: number;
  pageSize: number;
  status?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SourceFileSummary {
  sourceFile: string;
  totalCount: number;
  processedCount: number;
  pendingCount: number;
}
