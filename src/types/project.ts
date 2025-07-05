export interface Project {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "pending" | "archived";
  created_at: string;
  updated_at: string;
  stage_count?: number;
  platforms?: SocialMediaPlatform[]
}

export interface SocialMediaPlatform {
  id: string;
  name: string;
}

export interface ProjectSummary  {
  project_id:string;
  project_name: string;
  total: number;
  invitations: {
    status: string;
    invitation_count: number;
  }[];
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
  privacy: "public" | "private";
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  stage_id: string;
  creator_id: string;
  admin_id?: string | null;
  title: string;
  description?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  created_at: string;
  updated_at: string;
  creator_invitation_id?: string | null;
}
