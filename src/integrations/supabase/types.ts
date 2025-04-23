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
      country_phone_codes: {
        Row: {
          created_at: string
          id: string
          iso2: string
          iso3: string
          name_en: string
          name_es: string
          phone_code: string
          status: Database["public"]["Enums"]["country_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          iso2: string
          iso3: string
          name_en: string
          name_es: string
          phone_code: string
          status?: Database["public"]["Enums"]["country_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          iso2?: string
          iso3?: string
          name_en?: string
          name_es?: string
          phone_code?: string
          status?: Database["public"]["Enums"]["country_status"]
          updated_at?: string
        }
        Relationships: []
      }
      creator_inventory: {
        Row: {
          apellido: string
          codigo_invitacion: string | null
          correo: string
          elegible_tiktok: boolean | null
          elegible_youtube: boolean | null
          engagement_tiktok: number | null
          engagement_youtube: number | null
          enviado_hubspot: boolean | null
          estatus: string | null
          fecha_consulta_videos: string | null
          fecha_creacion: string | null
          fecha_descarga_yt: string | null
          fecha_envio_hubspot: string | null
          id: string
          lada_telefono: string | null
          nombre: string
          page_facebook: string | null
          secuid_tiktok: string | null
          seguidores_pinterest: number | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          telefono: string | null
          tiene_invitacion: boolean | null
          tiene_nombre_real:
            | Database["public"]["Enums"]["nombre_real_status"]
            | null
          tiene_prompt_generado: boolean | null
          usuario_asignado: string | null
          usuario_pinterest: string | null
          usuario_tiktok: string | null
          usuario_youtube: string | null
          views_youtube: number | null
        }
        Insert: {
          apellido: string
          codigo_invitacion?: string | null
          correo: string
          elegible_tiktok?: boolean | null
          elegible_youtube?: boolean | null
          engagement_tiktok?: number | null
          engagement_youtube?: number | null
          enviado_hubspot?: boolean | null
          estatus?: string | null
          fecha_consulta_videos?: string | null
          fecha_creacion?: string | null
          fecha_descarga_yt?: string | null
          fecha_envio_hubspot?: string | null
          id?: string
          lada_telefono?: string | null
          nombre: string
          page_facebook?: string | null
          secuid_tiktok?: string | null
          seguidores_pinterest?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          telefono?: string | null
          tiene_invitacion?: boolean | null
          tiene_nombre_real?:
            | Database["public"]["Enums"]["nombre_real_status"]
            | null
          tiene_prompt_generado?: boolean | null
          usuario_asignado?: string | null
          usuario_pinterest?: string | null
          usuario_tiktok?: string | null
          usuario_youtube?: string | null
          views_youtube?: number | null
        }
        Update: {
          apellido?: string
          codigo_invitacion?: string | null
          correo?: string
          elegible_tiktok?: boolean | null
          elegible_youtube?: boolean | null
          engagement_tiktok?: number | null
          engagement_youtube?: number | null
          enviado_hubspot?: boolean | null
          estatus?: string | null
          fecha_consulta_videos?: string | null
          fecha_creacion?: string | null
          fecha_descarga_yt?: string | null
          fecha_envio_hubspot?: string | null
          id?: string
          lada_telefono?: string | null
          nombre?: string
          page_facebook?: string | null
          secuid_tiktok?: string | null
          seguidores_pinterest?: number | null
          seguidores_tiktok?: number | null
          seguidores_youtube?: number | null
          telefono?: string | null
          tiene_invitacion?: boolean | null
          tiene_nombre_real?:
            | Database["public"]["Enums"]["nombre_real_status"]
            | null
          tiene_prompt_generado?: boolean | null
          usuario_asignado?: string | null
          usuario_pinterest?: string | null
          usuario_tiktok?: string | null
          usuario_youtube?: string | null
          views_youtube?: number | null
        }
        Relationships: []
      }
      creator_invitations: {
        Row: {
          created_at: string
          current_stage_id: string | null
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
          residence_country_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
          youtube_channel: string | null
        }
        Insert: {
          created_at?: string
          current_stage_id?: string | null
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
          residence_country_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
          youtube_channel?: string | null
        }
        Update: {
          created_at?: string
          current_stage_id?: string | null
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
          residence_country_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
          youtube_channel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_invitations_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      email_creators: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          link_invitation: string | null
          prompt: string | null
          prompt_output: string | null
          source_file: string | null
          status: string
          tiktok_link: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          link_invitation?: string | null
          prompt?: string | null
          prompt_output?: string | null
          source_file?: string | null
          status?: string
          tiktok_link: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          link_invitation?: string | null
          prompt?: string | null
          prompt_output?: string | null
          source_file?: string | null
          status?: string
          tiktok_link?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          error_message: string | null
          id: string
          invitation_id: string
          notification_setting_id: string
          sent_at: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          error_message?: string | null
          id?: string
          invitation_id: string
          notification_setting_id: string
          sent_at?: string | null
          stage_id?: string | null
          status: Database["public"]["Enums"]["notification_status"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          error_message?: string | null
          id?: string
          invitation_id?: string
          notification_setting_id?: string
          sent_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "creator_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_notification_setting_id_fkey"
            columns: ["notification_setting_id"]
            isOneToOne: false
            referencedRelation: "notification_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string | null
          delay_days: number
          enabled: boolean
          frequency_days: number
          id: string
          max_notifications: number
          message: string
          stage_id: string | null
          subject: string | null
          type: Database["public"]["Enums"]["notification_types"]
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          delay_days?: number
          enabled?: boolean
          frequency_days?: number
          id?: string
          max_notifications?: number
          message: string
          stage_id?: string | null
          subject?: string | null
          type: Database["public"]["Enums"]["notification_types"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          delay_days?: number
          enabled?: boolean
          frequency_days?: number
          id?: string
          max_notifications?: number
          message?: string
          stage_id?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["notification_types"]
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
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
            referencedRelation: "creator_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      youtube_shorts: {
        Row: {
          comments: number | null
          created_at: string
          creator_id: string
          duration: number | null
          id: string
          likes: number | null
          published_date: string | null
          title: string | null
          updated_at: string
          url: string | null
          video_id: string
          views: number | null
        }
        Insert: {
          comments?: number | null
          created_at?: string
          creator_id: string
          duration?: number | null
          id?: string
          likes?: number | null
          published_date?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          video_id: string
          views?: number | null
        }
        Update: {
          comments?: number | null
          created_at?: string
          creator_id?: string
          duration?: number | null
          id?: string
          likes?: number | null
          published_date?: string | null
          title?: string | null
          updated_at?: string
          url?: string | null
          video_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "youtube_shorts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creator_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      summary_creator: {
        Row: {
          apellido: string | null
          average_duration_tiktok: number | null
          average_duration_youtube: number | null
          correo: string | null
          date_last_post_tiktok: number | null
          engagement_tiktok: number | null
          engagement_youtube: number | null
          enviado_hubspot: boolean | null
          fecha_creacion: string | null
          fecha_envio_hubspot: string | null
          nombre: string | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          tiene_invitacion: boolean | null
          tiene_prompt_generado: boolean | null
          usuario_tiktok: string | null
          usuario_youtube: string | null
        }
        Relationships: []
      }
      summary_creator_final: {
        Row: {
          apellido: string | null
          average_duration_tiktok: number | null
          average_duration_youtube: number | null
          correo: string | null
          date_last_post_tiktok: number | null
          engagement_tiktok: number | null
          engagement_youtube: number | null
          enviado_hubspot: boolean | null
          fecha_creacion: string | null
          fecha_envio_hubspot: string | null
          nombre: string | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          tiene_invitacion: boolean | null
          tiene_nombre_real:
            | Database["public"]["Enums"]["nombre_real_status"]
            | null
          tiene_prompt_generado: boolean | null
          usuario_tiktok: string | null
          usuario_youtube: string | null
        }
        Relationships: []
      }
      yt_summary_creator: {
        Row: {
          apellido: string | null
          average_duration_tiktok: number | null
          average_duration_youtube: number | null
          correo: string | null
          date_last_post_tiktok: number | null
          engagement_tiktok: number | null
          engagement_youtube: number | null
          nombre: string | null
          seguidores_tiktok: number | null
          seguidores_youtube: number | null
          usuario_tiktok: string | null
          usuario_youtube: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      execute_task_search: {
        Args: { query_text: string }
        Returns: Json
      }
      find_invitation_by_code: {
        Args: { code_param: string }
        Returns: {
          created_at: string
          current_stage_id: string | null
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
          residence_country_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
          youtube_channel: string | null
        }[]
      }
      get_creators_by_project_stage: {
        Args: { project_id_param: string; stage_id_param: string }
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
        Args: { project_id_param: string }
        Returns: {
          stage_id: string
          stage_name: string
          creators_count: number
        }[]
      }
      get_table_definition: {
        Args: { table_name: string }
        Returns: string
      }
      get_tasks_count_by_stage: {
        Args: { project_id_param: string }
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
        Args: { user_id: string }
        Returns: string
      }
      is_stage_in_project: {
        Args: { stage_id: string; project_id_param: string }
        Returns: boolean
      }
      search_countries: {
        Args: { search_term: string }
        Returns: {
          id: string
          name_es: string
          name_en: string
          phone_code: string
        }[]
      }
      update_stages_order: {
        Args: { stages_data: Json[] }
        Returns: undefined
      }
    }
    Enums: {
      country_status: "active" | "inactive"
      invitation_status: "pending" | "accepted" | "rejected" | "completed"
      nombre_real_status: "pendiente" | "proceso" | "error" | "completado"
      notification_channel: "sms" | "email"
      notification_status: "sent" | "failed" | "pending"
      notification_types: "reminder" | "notification" | "alert"
      task_status: "pending" | "in_progress" | "completed" | "review"
      user_role: "admin" | "creator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      country_status: ["active", "inactive"],
      invitation_status: ["pending", "accepted", "rejected", "completed"],
      nombre_real_status: ["pendiente", "proceso", "error", "completado"],
      notification_channel: ["sms", "email"],
      notification_status: ["sent", "failed", "pending"],
      notification_types: ["reminder", "notification", "alert"],
      task_status: ["pending", "in_progress", "completed", "review"],
      user_role: ["admin", "creator"],
    },
  },
} as const
