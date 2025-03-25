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
      bulk_creator_invitation_details: {
        Row: {
          bulk_invitation_id: string
          created_at: string
          email: string
          error_message: string | null
          full_name: string
          id: string
          is_active: boolean
          status: string
          updated_at: string
        }
        Insert: {
          bulk_invitation_id: string
          created_at?: string
          email: string
          error_message?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          bulk_invitation_id?: string
          created_at?: string
          email?: string
          error_message?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_creator_invitation_details_bulk_invitation_id_fkey"
            columns: ["bulk_invitation_id"]
            isOneToOne: false
            referencedRelation: "bulk_creator_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_creator_invitations: {
        Row: {
          created_at: string
          created_by: string
          failed_rows: number
          file_name: string
          id: string
          processed_rows: number
          status: string
          total_rows: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          failed_rows?: number
          file_name: string
          id?: string
          processed_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          failed_rows?: number
          file_name?: string
          id?: string
          processed_rows?: number
          status?: string
          total_rows?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_invitations: {
        Row: {
          created_at: string
          email: string
          facebook_page: string | null
          full_name: string
          id: string
          instagram_user: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          phone_country_code: string | null
          phone_number: string | null
          phone_verified: boolean | null
          project_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
          youtube_channel: string | null
        }
        Insert: {
          created_at?: string
          email: string
          facebook_page?: string | null
          full_name: string
          id?: string
          instagram_user?: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          phone_country_code?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          project_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
          youtube_channel?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          facebook_page?: string | null
          full_name?: string
          id?: string
          instagram_user?: string | null
          invitation_code?: string
          invitation_type?: string
          invitation_url?: string
          phone_country_code?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          project_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
          youtube_channel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      inventario_creadores: {
        Row: {
          apellido: string
          correo: string
          elegible_tiktok: boolean | null
          elegible_youtube: boolean | null
          engagement_tiktok: number | null
          engagement_youtube: number | null
          estatus: string | null
          fecha_creacion: string | null
          id: string
          lada_telefono: string | null
          nombre: string
          page_facebook: string | null
          seguidores_pinterest: number | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          telefono: string | null
          usuario_pinterest: string | null
          usuario_tiktok: string | null
          usuario_youtube: string | null
        }
        Insert: {
          apellido: string
          correo: string
          elegible_tiktok?: boolean | null
          elegible_youtube?: boolean | null
          engagement_tiktok?: number | null
          engagement_youtube?: number | null
          estatus?: string | null
          fecha_creacion?: string | null
          id?: string
          lada_telefono?: string | null
          nombre: string
          page_facebook?: string | null
          seguidores_pinterest?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          telefono?: string | null
          usuario_pinterest?: string | null
          usuario_tiktok?: string | null
          usuario_youtube?: string | null
        }
        Update: {
          apellido?: string
          correo?: string
          elegible_tiktok?: boolean | null
          elegible_youtube?: boolean | null
          engagement_tiktok?: number | null
          engagement_youtube?: number | null
          estatus?: string | null
          fecha_creacion?: string | null
          id?: string
          lada_telefono?: string | null
          nombre?: string
          page_facebook?: string | null
          seguidores_pinterest?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          telefono?: string | null
          usuario_pinterest?: string | null
          usuario_tiktok?: string | null
          usuario_youtube?: string | null
        }
        Relationships: []
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
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          profile_photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          created_at: string
          id: string
          name: string
          order_index: number
          privacy: string
          project_id: string
          response_negative: string | null
          response_positive: string | null
          responsible: string
          slug: string
          updated_at: string
          url: string
          view: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          order_index: number
          privacy?: string
          project_id: string
          response_negative?: string | null
          response_positive?: string | null
          responsible: string
          slug: string
          updated_at?: string
          url: string
          view: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          order_index?: number
          privacy?: string
          project_id?: string
          response_negative?: string | null
          response_positive?: string | null
          responsible?: string
          slug?: string
          updated_at?: string
          url?: string
          view?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          admin_id: string | null
          created_at: string
          creator_id: string | null
          creator_invitation_id: string | null
          description: string | null
          id: string
          project_id: string
          stage_id: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          creator_id?: string | null
          creator_invitation_id?: string | null
          description?: string | null
          id?: string
          project_id: string
          stage_id: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          creator_id?: string | null
          creator_invitation_id?: string | null
          description?: string | null
          id?: string
          project_id?: string
          stage_id?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_creator_invitation_id_fkey"
            columns: ["creator_invitation_id"]
            isOneToOne: false
            referencedRelation: "creator_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_video: {
        Row: {
          author: string | null
          author_id: string | null
          create_time: number | null
          created_at: string
          creator_id: string
          description: string | null
          duration: number | null
          id: string
          number_of_comments: number | null
          number_of_hearts: number | null
          number_of_plays: number | null
          number_of_reposts: number | null
          updated_at: string
          video_definition: string | null
          video_id: string
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          create_time?: number | null
          created_at?: string
          creator_id: string
          description?: string | null
          duration?: number | null
          id?: string
          number_of_comments?: number | null
          number_of_hearts?: number | null
          number_of_plays?: number | null
          number_of_reposts?: number | null
          updated_at?: string
          video_definition?: string | null
          video_id: string
        }
        Update: {
          author?: string | null
          author_id?: string | null
          create_time?: number | null
          created_at?: string
          creator_id?: string
          description?: string | null
          duration?: number | null
          id?: string
          number_of_comments?: number | null
          number_of_hearts?: number | null
          number_of_plays?: number | null
          number_of_reposts?: number | null
          updated_at?: string
          video_definition?: string | null
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_video_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "inventario_creadores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_invitation_by_code: {
        Args: {
          code_param: string
        }
        Returns: {
          created_at: string
          email: string
          facebook_page: string | null
          full_name: string
          id: string
          instagram_user: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          phone_country_code: string | null
          phone_number: string | null
          phone_verified: boolean | null
          project_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
          youtube_channel: string | null
        }[]
      }
      get_creators_by_project_stage: {
        Args: {
          project_id_param: string
          stage_id_param: string
        }
        Returns: {
          creator_id: string
          first_name: string
          last_name: string
          email: string
          task_count: number
          pending_count: number
          in_progress_count: number
          completed_count: number
          review_count: number
        }[]
      }
      get_creators_count_by_stage: {
        Args: {
          project_id_param: string
        }
        Returns: {
          stage_id: string
          stage_name: string
          creators_count: number
        }[]
      }
      get_table_definition: {
        Args: {
          table_name: string
        }
        Returns: string
      }
      get_tasks_count_by_stage: {
        Args: {
          project_id_param: string
        }
        Returns: {
          stage_id: string
          stage_name: string
          tasks_count: number
          pending_count: number
          in_progress_count: number
          completed_count: number
          review_count: number
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      update_stages_order: {
        Args: {
          stages_data: Json[]
        }
        Returns: undefined
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "rejected"
      task_status: "pending" | "in_progress" | "completed" | "review"
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
