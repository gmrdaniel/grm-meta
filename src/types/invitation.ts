import { Project } from "./project";

export interface CreatorInvitation {
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  residence_country_id: any;
  id: string;
  project_id?: string | null;
  projects?: Project
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
  invitation_code: string;
  invitation_url: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  invitation_type: string;
  created_at: string;
  updated_at: string;
  phone_number?: string | null;
  phone_country_code?: string | null;
  phone_verified?: boolean;
  current_stage_id: string | null;
  fb_step_completed: boolean
  is_professional_account?: boolean
}

export type CreateInvitationData = {
  first_name: string;
  last_name: string;
  email: string;
  social_media_handle?: string | null; // Para TikTok
  youtube_channel?: string | null;     // Para YouTube
  instagram_user?: string | null; // Para Instagram
  social_media_type?: string | null;
  project_id: string;
  projects?: Project
  invitation_type: string;
};

export type UpdateFacebookPageData = {
  facebookPageUrl: string;
  verifyOwnership: boolean;
  linkInstagram: boolean;
};

// Define a type for task with creator invitation relation
export interface TaskWithInvitation {
  taskId: string;
  creatorInvitationId: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  title: string;
  created_at: string;
}
