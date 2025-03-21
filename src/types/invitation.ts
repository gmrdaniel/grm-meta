
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
  invitation_code: string;
  invitation_url: string;
  status: string;
  invitation_type: string;
  created_at: string;
  updated_at: string;
  phone_number?: string | null;
  phone_country_code?: string | null;
  phone_verified?: boolean;
}

export type CreateInvitationData = Pick<
  CreatorInvitation,
  "full_name" | "email" | "social_media_handle" | "social_media_type" | "project_id" | "invitation_type"
>;
