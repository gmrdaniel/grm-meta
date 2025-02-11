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
      personal_data: {
        Row: {
          birth_date: string | null
          category: string | null
          country_code: string | null
          country_of_residence: string | null
          created_at: string
          gender: string | null
          id: string
          instagram_followers: number | null
          instagram_username: string | null
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
          gender?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_username?: string | null
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
          gender?: string | null
          id?: string
          instagram_followers?: number | null
          instagram_username?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      payment_method: "bank_transfer" | "paypal"
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
