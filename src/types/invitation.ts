
import { Project } from "./project";

export interface CreatorInvitation {
  id: string;
  project_id?: string | null;
  projects?: Project;
  email: string;
  first_name: string;
  last_name: string;
  social_media_type?: string | null;
  social_media_handle?: string | null;
  other_social_media?: string | null;
  youtube_social_media?: string;
  youtube_channel?: string | null;
  instagram_user?: string | null;
  facebook_page?: string | null;
  facebook_profile?: string | null;
  invitation_code: string;
  invitation_url: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "in process" | "sended";
  invitation_type: string;
  created_at: string;
  updated_at: string;
  phone_number?: string | null;
  phone_country_code?: string | null;
  phone_verified?: boolean;
  current_stage_id: string | null;
  fb_step_completed: boolean;
  is_professional_account?: boolean;
  stage_updated_at?: string | null;
  is_business_account?: boolean | null;
  project_stages?: { name: string };
  pinterest_url?: string | null;
}

export type CreateInvitationData = {
  first_name: string;
  last_name: string;
  email: string;
  social_media_handle?: string | null;
  youtube_channel?: string | null;
  instagram_user?: string | null;
  social_media_type?: string | null;
  project_id: string;
  projects?: Project;
  invitation_type: string;
  phone_number?: string | null;
  phone_country_code?: string | null;
  facebook_page?: string | null;
  facebook_profile?: string | null;
  phone_verified?: boolean | null;
  fb_step_completed?: boolean | null;
  is_professional_account?: boolean | null;
  status?: "pending" | "accepted" | "rejected" | "completed" | "in process" | "sended";
};

export type UpdateFacebookPageData = {
  facebookPageUrl: string;
  verifyOwnership: boolean;
  linkInstagram: boolean;
};

export interface TaskWithInvitation {
  taskId: string;
  creatorInvitationId: string | null;
  status: "pending" | "in_progress" | "completed" | "review";
  title: string;
  created_at: string;
}

export type EditInvitationData = Omit<CreatorInvitation, "id">;
