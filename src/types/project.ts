
export interface Project {
  id: string;
  name: string;
  status: "draft" | "active" | "archived";
  slug?: string | null;
  created_at: string;
  updated_at: string;
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
  responsible: string;
  privacy: string;
  response_positive?: string | null;
  response_negative?: string | null;
  created_at: string;
  updated_at: string;
}
