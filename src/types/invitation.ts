export interface CreatorInvitation {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  invitation_code: string;
  invitation_url: string;
  status: 'pending' | 'accepted' | 'rejected';
  facebook_page?: string;
  invitation_type: string;
  project_id?: string;
  social_media_type?: string;
  social_media_handle?: string;
  updated_at: string;
}

/**
 * Data for creating a new invitation
 */
export interface CreateInvitationData {
  email: string;
  full_name: string;
  invitation_type: string;
  project_id?: string;
  social_media_type?: string;
  social_media_handle?: string;
}

export interface UpdateFacebookPageData {
  facebook_page: string;
}

export interface TaskWithInvitation {
  id: string;
  created_at: string;
  name: string;
  description: string;
  due_date: string;
  status: 'open' | 'in progress' | 'done' | 'blocked';
  creator_invitation_id: string;
  creator_invitations: CreatorInvitation;
}
