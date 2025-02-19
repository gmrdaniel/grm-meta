export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bank_details: {
        Row: {
          bank_account_number: string | null
          bank_address: string | null
          bank_name: string | null
          beneficiary_name: string
          clabe: string | null
          country: string
          country_id: string | null
          created_at: string
          iban: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          paypal_email: string | null
          profile_id: string
          routing_number: string | null
          swift_bic: string | null
          updated_at: string
        }
        Insert: {
          bank_account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          beneficiary_name: string
          clabe?: string | null
          country: string
          country_id?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          paypal_email?: string | null
          profile_id: string
          routing_number?: string | null
          swift_bic?: string | null
          updated_at?: string
        }
        Update: {
          bank_account_number?: string | null
          bank_address?: string | null
          bank_name?: string | null
          beneficiary_name?: string
          clabe?: string | null
          country?: string
          country_id?: string | null
          created_at?: string
          iban?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          paypal_email?: string | null
          profile_id?: string
          routing_number?: string | null
          swift_bic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_details_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "country"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_details_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_status: string
          created_at: string | null
          duration: number | null
          end_date: string | null
          id: string
          profile_id: string | null
          renewable: boolean | null
          service_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          contract_status: string
          created_at?: string | null
          duration?: number | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          renewable?: boolean | null
          service_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          contract_status?: string
          created_at?: string | null
          duration?: number | null
          end_date?: string | null
          id?: string
          profile_id?: string | null
          renewable?: boolean | null
          service_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      country: {
        Row: {
          active: boolean
          code: string
          created_at: string
          display_order: number
          id: string
          name_en: string
          name_es: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          display_order?: number
          id?: string
          name_en: string
          name_es: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          name_en?: string
          name_es?: string
          updated_at?: string
        }
        Relationships: []
      }
      creator_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          service_id: string
          status: string
          token: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          service_id: string
          status?: string
          token?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          service_id?: string
          status?: string
          token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_invitations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_rates: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          platform_id: string
          post_type_id: string
          rate_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          platform_id: string
          post_type_id: string
          rate_usd: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          platform_id?: string
          post_type_id?: string
          rate_usd?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_rates_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_rates_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_rates_post_type_id_fkey"
            columns: ["post_type_id"]
            isOneToOne: false
            referencedRelation: "post_types"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_services: {
        Row: {
          company_share: number | null
          contract_duration: number | null
          contract_id: string | null
          created_at: string | null
          end_date: string | null
          fixed_fee: number | null
          id: string
          monthly_fee: number | null
          profile_id: string | null
          service_id: string | null
          start_date: string | null
          status: string
          terms_accepted: boolean | null
          terms_conditions: string | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          company_share?: number | null
          contract_duration?: number | null
          contract_id?: string | null
          created_at?: string | null
          end_date?: string | null
          fixed_fee?: number | null
          id?: string
          monthly_fee?: number | null
          profile_id?: string | null
          service_id?: string | null
          start_date?: string | null
          status: string
          terms_accepted?: boolean | null
          terms_conditions?: string | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          company_share?: number | null
          contract_duration?: number | null
          contract_id?: string | null
          created_at?: string | null
          end_date?: string | null
          fixed_fee?: number | null
          id?: string
          monthly_fee?: number | null
          profile_id?: string | null
          service_id?: string | null
          start_date?: string | null
          status?: string
          terms_accepted?: boolean | null
          terms_conditions?: string | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_services_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_services_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          profile_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          profile_id: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          profile_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_data: {
        Row: {
          birth_date: string | null
          category: string | null
          country_code: string | null
          country_of_residence: string | null
          created_at: string
          first_name: string | null
          gender: string | null
          id: string
          instagram_followers: number | null
          instagram_username: string | null
          last_name: string | null
          phone_number: string | null
          pinterest_followers: number | null
          pinterest_username: string | null
          profile_id: string
          profile_photo_url: string | null
          state_of_residence: string | null
          tiktok_followers: number | null
          tiktok_username: string | null
          updated_at: string
          youtube_followers: number | null
          youtube_username: string | null
        }
        Insert: {
          birth_date?: string | null
          category?: string | null
          country_code?: string | null
          country_of_residence?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_username?: string | null
          last_name?: string | null
          phone_number?: string | null
          pinterest_followers?: number | null
          pinterest_username?: string | null
          profile_id: string
          profile_photo_url?: string | null
          state_of_residence?: string | null
          tiktok_followers?: number | null
          tiktok_username?: string | null
          updated_at?: string
          youtube_followers?: number | null
          youtube_username?: string | null
        }
        Update: {
          birth_date?: string | null
          category?: string | null
          country_code?: string | null
          country_of_residence?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_username?: string | null
          last_name?: string | null
          phone_number?: string | null
          pinterest_followers?: number | null
          pinterest_username?: string | null
          profile_id?: string
          profile_photo_url?: string | null
          state_of_residence?: string | null
          tiktok_followers?: number | null
          tiktok_username?: string | null
          updated_at?: string
          youtube_followers?: number | null
          youtube_username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_data_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_types: {
        Row: {
          created_at: string
          id: string
          name: string
          platform_id: string
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          platform_id: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          platform_id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_types_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      service_payments: {
        Row: {
          brand_payment_date: string | null
          brand_payment_status: string
          company_earning: number
          created_at: string | null
          creator_earning: number
          creator_payment_date: string | null
          creator_payment_status: string
          creator_service_id: string | null
          id: string
          is_recurring: boolean | null
          payment_date: string | null
          payment_month: string | null
          payment_period: string | null
          payment_receipt_url: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          brand_payment_date?: string | null
          brand_payment_status?: string
          company_earning: number
          created_at?: string | null
          creator_earning: number
          creator_payment_date?: string | null
          creator_payment_status?: string
          creator_service_id?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_date?: string | null
          payment_month?: string | null
          payment_period?: string | null
          payment_receipt_url?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          brand_payment_date?: string | null
          brand_payment_status?: string
          company_earning?: number
          created_at?: string | null
          creator_earning?: number
          creator_payment_date?: string | null
          creator_payment_status?: string
          creator_service_id?: string | null
          id?: string
          is_recurring?: boolean | null
          payment_date?: string | null
          payment_month?: string | null
          payment_period?: string | null
          payment_receipt_url?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_payments_creator_service_id_fkey"
            columns: ["creator_service_id"]
            isOneToOne: false
            referencedRelation: "creator_services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          company_share_max: number | null
          company_share_min: number | null
          contract_duration: number | null
          created_at: string | null
          description: string | null
          fixed_fee: number | null
          id: string
          max_revenue: number | null
          name: string
          renewable: boolean | null
          terms_conditions: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          company_share_max?: number | null
          company_share_min?: number | null
          contract_duration?: number | null
          created_at?: string | null
          description?: string | null
          fixed_fee?: number | null
          id?: string
          max_revenue?: number | null
          name: string
          renewable?: boolean | null
          terms_conditions?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          company_share_max?: number | null
          company_share_min?: number | null
          contract_duration?: number | null
          created_at?: string | null
          description?: string | null
          fixed_fee?: number | null
          id?: string
          max_revenue?: number | null
          name?: string
          renewable?: boolean | null
          terms_conditions?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      social_platforms: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_email: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      payment_method: "bank_transfer" | "paypal"
      status_type: "active" | "inactive"
      user_role: "admin" | "creator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
