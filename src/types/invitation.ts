
export interface CreatorInvitation {
  id: string;
  project_id?: string | null;
  email: string;
  full_name: string;
  social_media_type?: string | null;
  social_media_handle?: string | null;
  other_social_media?: string | null;
  youtube_channel?: string | null;
  instagram_user?: string | null;
  facebook_page?: string | null;
  invitation_code: string;
  invitation_url: string;
  status: 'pending' | 'accepted' | 'rejected';
  invitation_type: string;
  created_at: string;
  updated_at: string;
  phone_number?: string | null;
  phone_country_code?: string | null;
  phone_verified?: boolean;
}

export type CreateInvitationData = {
  full_name: string;
  email: string;
  social_media_handle?: string | null;
  social_media_type?: string | null;
  project_id: string;
  invitation_type: string;
};

export type UpdateFacebookPageData = {
  facebookPageUrl: string;
  verifyOwnership: boolean;
  linkInstagram: boolean;
};

// New addition: Define a type for task with creator invitation relation
export interface TaskWithInvitation {
  taskId: string;
  creatorInvitationId: string | null;
}
