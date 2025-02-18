
export interface CreatorRate {
  id: string;
  creator_id: string;
  platform_id: string;
  post_type_id: string;
  rate_usd: number;
}

export interface CreatorBasicInfo {
  id: string;
  personal_data: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
  } | null;
}

export interface Platform {
  id: string;
  name: string;
  status: string;
}

export interface PostType {
  id: string;
  name: string;
  status: string;
  platform_id: string;
}
