
export interface Project {
  id: string;
  name: string;
  status: "draft" | "active" | "archived" | "pending";
  slug?: string | null;
  created_at: string;
  updated_at: string;
  stage_count?: number;
  platforms?: Array<{
    id: string;
    name: string;
  }>;
}

export interface ProjectStage {
  id: string;
  name: string;
  slug: string;
  project_id: string;
  order_index: number;
  view: string;
  url: string;
  responsible: "admin" | "creator" | "system";
  privacy: string;
  response_positive?: string | null;
  response_negative?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaPlatform {
  id: string;
  name: string;
  created_at?: string;
}
