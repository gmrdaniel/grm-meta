
export interface Rate {
  id: string;
  creator_profile: {
    full_name: string;
  };
  post_types: {
    name: string;
    social_platforms: {
      name: string;
      id: string;
    };
  };
  rate_usd: number;
  is_active: boolean;
}

export interface RatesListProps {
  page: number;
  itemsPerPage: number;
}

export interface FilterState {
  selectedPlatform?: string;
  selectedPostType?: string;
  priceRange: [number, number];
  page: number;
  itemsPerPage: number;
}
