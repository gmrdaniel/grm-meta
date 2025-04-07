
export interface EmailCreator {
  id: string;
  full_name: string;
  tiktok_link: string;
  created_at: string;
  status: 'active' | 'inactive';
}

export type EmailCreatorImportRow = {
  full_name: string;
  tiktok_link: string;
};

export type EmailCreatorImportResult = {
  successful: number;
  failed: number;
  errors: { row: number; message: string }[];
};
