
export interface CreatorInvitation {
  id: string;
  full_name: string;
  email: string;
  social_media_handle: string | null;
  social_media_type: "tiktok" | "pinterest" | null;
  project_id: string | null;
  invitation_type: "new_user" | "existing_user";
  invitation_url: string;
  invitation_code: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export type CreateInvitationData = Omit<CreatorInvitation, "id" | "invitation_url" | "invitation_code" | "status" | "created_at" | "updated_at">;
