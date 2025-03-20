
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
  url: string;
  view: string;
  responsible: "system" | "creator";
  next_positive_view?: string;
  next_negative_view?: string;
  order: number;
  created_at: string;
  updated_at: string;
}
