
export interface EmailCreator {
  id: string;
  full_name: string;
  email: string;
  tiktok_link: string;
  created_at: string;
  prompt?: string;
  prompt_output?: string;
  status: 'active' | 'inactive';
}

export type EmailCreatorImportRow = {
  full_name: string;
  email: string;
  tiktok_link: string;
};

export type EmailCreatorImportResult = {
  successful: number;
  failed: number;
  errors: { row: number; message: string }[];
};
