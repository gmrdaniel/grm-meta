
export interface Project {
  id: string;
  name: string;
  status: "draft" | "active" | "pending" | "archived";
  created_at: string;
  updated_at: string;
}

export interface ProjectStage {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  url: string;
  view: string;
  responsible: "system" | "creator" | "admin";
  response_positive?: string;
  response_negative?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}
