export interface FacebookPageDetails {
    name: string;
    type: string;
    page_id: string;
    url: string;
    image: string;
    intro: string | null;
    likes: number;
    followers: number;
    categories: string[];
    phone: string | null;
    email: string | null;
    address: string | null;
    rating: number | null;
    services: string[] | null;
    price_range: string | null;
    website: string | null;
    delegate_page: {
      is_business_page_active: boolean;
      id: string;
    };
    cover_image: string;
    verified: boolean;
  }
  