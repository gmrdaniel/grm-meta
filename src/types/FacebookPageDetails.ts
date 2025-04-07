
export interface FacebookPageDetails {
  id: string;
  name: string;
  url: string;
  type: string;
  verified: boolean;
  follower_count?: number;
  likes?: number;
  category?: string;
  profile_picture_url?: string;
}
