export interface InstagramUserResponse {
    result: {
      result : {
      user: InstagramUser;
    }[]
    status: string;
  }
}
  
  export interface InstagramUser {
    ai_agent_type: string | null;
    biography: string;
    bio_links: BioLink[];
    fb_profile_biolink: string | null;
    biography_with_entities: {
      raw_text: string;
      entities: [];
    };
    blocked_by_viewer: boolean;
    restricted_by_viewer: boolean;
    country_block: boolean;
    eimu_id: string;
    external_url: string;
    external_url_linkshimmed: string;
    edge_followed_by: {
      count: number;
    };
    fbid: string;
    followed_by_viewer: boolean;
    edge_follow: {
      count: number;
    };
    follows_viewer: boolean;
    first_name: string;
    group_metadata: unknown;
    has_ar_effects: boolean;
    has_clips: boolean;
    has_guides: boolean;
    has_chaining: boolean;
    has_channel: boolean;
    has_blocked_viewer: boolean;
    highlight_reel_count: number;
    has_requested_viewer: boolean;
    hide_like_and_view_counts: boolean;
    id: string;
    is_business_account: boolean;
    is_professional_account: boolean;
    is_supervision_enabled: boolean;
    is_guardian_of_viewer: boolean;
    is_supervised_by_viewer: boolean;
    is_supervised_user: boolean;
    is_embeds_disabled: boolean;
    is_joined_recently: boolean;
    guardian_id: string | null;
    business_address_json: string | null;
    business_contact_method: string;
    business_email: string | null;
    business_phone_number: string | null;
    business_category_name: string | null;
    overall_category_name: string | null;
    category_enum: string | null;
    category_name: string | null;
    is_private: boolean;
    is_verified: boolean;
    is_verified_by_mv4b: boolean;
    is_regulated_c18: boolean;
    edge_mutual_followed_by: {
      count: number;
      edges: [];
    };
    pinned_channels_list_count: number;
    profile_pic_url: string;
    profile_pic_url_hd: string;
    requested_by_viewer: boolean;
    should_show_category: boolean;
    should_show_public_contacts: boolean;
    show_account_transparency_details: boolean;
    transparency_label: string | null;
    transparency_product: string | null;
    username: string;
    connected_fb_page: string | null;
    pronouns: string[];
    edge_owner_to_timeline_media: {
      count: number;
      page_info: {
        has_next_page: boolean;
        end_cursor: string;
      };
      edges: [];
    };
  }
  
  export interface BioLink {
    title: string;
    lynx_url: string;
    url: string;
    link_type: string;
  }
  