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
      content_categories: {
        Row: {
          created_at: string | null
          id: string
          key: string
          name_en: string
          name_es: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          name_en: string
          name_es: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          name_en?: string
          name_es?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          iso2: string
          iso3: string
          name_en: string
          name_es: string
          phone_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          iso2: string
          iso3: string
          name_en: string
          name_es: string
          phone_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          iso2?: string
          iso3?: string
          name_en?: string
          name_es?: string
          phone_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      creator_inventory: {
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
          secuid_tiktok: string | null
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
          secuid_tiktok?: string | null
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
          secuid_tiktok?: string | null
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
      creator_invitations: {
        Row: {
          created_at: string
          current_stage_id: string | null
          email: string
          facebook_page: string | null
          facebook_profile: string | null
          fb_step_completed: boolean
          first_name: string
          id: string
          instagram_user: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          is_business_account: boolean | null
          is_professional_account: boolean | null
          last_name: string | null
          phone_country_code: string | null
          phone_number: string | null
          phone_verified: boolean | null
          project_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          stage_updated_at: string | null
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
          youtube_channel: string | null
        }
        Insert: {
          created_at?: string
          current_stage_id?: string | null
          email: string
          facebook_page?: string | null
          facebook_profile?: string | null
          fb_step_completed?: boolean
          first_name: string
          id?: string
          instagram_user?: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          is_business_account?: boolean | null
          is_professional_account?: boolean | null
          last_name?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          project_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          stage_updated_at?: string | null
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
          youtube_channel?: string | null
        }
        Update: {
          created_at?: string
          current_stage_id?: string | null
          email?: string
          facebook_page?: string | null
          facebook_profile?: string | null
          fb_step_completed?: boolean
          first_name?: string
          id?: string
          instagram_user?: string | null
          invitation_code?: string
          invitation_type?: string
          invitation_url?: string
          is_business_account?: boolean | null
          is_professional_account?: boolean | null
          last_name?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          phone_verified?: boolean | null
          project_id?: string | null
          social_media_handle?: string | null
          social_media_type?: string | null
          stage_updated_at?: string | null
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
      creator_profile_categories: {
        Row: {
          content_category_id: string
          creator_profile_id: string
          id: string
        }
        Insert: {
          content_category_id: string
          creator_profile_id: string
          id?: string
        }
        Update: {
          content_category_id?: string
          creator_profile_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "creator_profile_categories_content_category_id_fkey"
            columns: ["content_category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_profile_categories_creator_profile_id_fkey"
            columns: ["creator_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string | null
          html: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          html: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          html?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string | null
          error_message: string | null
          id: string
          invitation_id: string
          notification_setting_id: string
          sent_at: string | null
          stage_id: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at: string | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          error_message?: string | null
          id?: string
          invitation_id: string
          notification_setting_id: string
          sent_at?: string | null
          stage_id?: string | null
          status: Database["public"]["Enums"]["notification_status"]
          updated_at?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string | null
          error_message?: string | null
          id?: string
          invitation_id?: string
          notification_setting_id?: string
          sent_at?: string | null
          stage_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          updated_at?: string | null
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
          target_status: string | null
          template_id: string | null
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
          target_status?: string | null
          template_id?: string | null
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
          target_status?: string | null
          template_id?: string | null
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
          {
            foreignKeyName: "notification_settings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
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
      profile_projects: {
        Row: {
          admin_id: string
          created_at: string | null
          fb_profile_id: string | null
          fb_profile_owner_id: string | null
          id: string
          joined_at: string
          profile_id: string
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          fb_profile_id?: string | null
          fb_profile_owner_id?: string | null
          id: string
          joined_at?: string
          profile_id: string
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          fb_profile_id?: string | null
          fb_profile_owner_id?: string | null
          id?: string
          joined_at?: string
          profile_id?: string
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_projects_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country_of_residence_id: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          meta_verified:
            | Database["public"]["Enums"]["meta_verification_status"]
            | null
          phone_country_code: string | null
          phone_number: string | null
          pinterest_url: string | null
          profile_photo_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          country_of_residence_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          meta_verified?:
            | Database["public"]["Enums"]["meta_verification_status"]
            | null
          phone_country_code?: string | null
          phone_number?: string | null
          pinterest_url?: string | null
          profile_photo_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          country_of_residence_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          meta_verified?:
            | Database["public"]["Enums"]["meta_verification_status"]
            | null
          phone_country_code?: string | null
          phone_number?: string | null
          pinterest_url?: string | null
          profile_photo_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_of_residence_id_fkey"
            columns: ["country_of_residence_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      project_allowed_countries: {
        Row: {
          country_id: string
          created_at: string | null
          description: string | null
          id: string
          project_id: string
        }
        Insert: {
          country_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
        }
        Update: {
          country_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_allowed_countries_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_allowed_countries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_content_categories: {
        Row: {
          content_category_id: string
          id: string
          project_id: string
        }
        Insert: {
          content_category_id: string
          id?: string
          project_id: string
        }
        Update: {
          content_category_id?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_content_categories_content_category_id_fkey"
            columns: ["content_category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_content_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_social_media_platforms: {
        Row: {
          created_at: string | null
          id: string
          platform_id: string
          project_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform_id: string
          project_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_social_media_platforms_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_media_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_social_media_platforms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          slug: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_platforms: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      social_media_profile: {
        Row: {
          bio: string | null
          company_trained: boolean | null
          creator_id: string
          engagement_rate: number | null
          followers: number | null
          following: number | null
          id: string
          monthly_views: number | null
          quality: Database["public"]["Enums"]["creator_quality"] | null
          social_media_platform_id: string
          total_likes: number | null
          total_views: number | null
          username: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_trained?: boolean | null
          creator_id: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id: string
          monthly_views?: number | null
          quality?: Database["public"]["Enums"]["creator_quality"] | null
          social_media_platform_id: string
          total_likes?: number | null
          total_views?: number | null
          username: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_trained?: boolean | null
          creator_id?: string
          engagement_rate?: number | null
          followers?: number | null
          following?: number | null
          id?: string
          monthly_views?: number | null
          quality?: Database["public"]["Enums"]["creator_quality"] | null
          social_media_platform_id?: string
          total_likes?: number | null
          total_views?: number | null
          username?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_profile_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_media_profile_social_media_platform_id_fkey"
            columns: ["social_media_platform_id"]
            isOneToOne: false
            referencedRelation: "social_media_platforms"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      summary_creator: {
        Row: {
          apellido: string | null
          correo: string | null
          date_last_post: number | null
          duration_average: number | null
          engagement: number | null
          nombre: string | null
          seguidores_tiktok: number | null
          usuario_tiktok: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      find_invitation_by_code: {
        Args: { code_param: string }
        Returns: {
          created_at: string
          current_stage_id: string | null
          email: string
          facebook_page: string | null
          facebook_profile: string | null
          fb_step_completed: boolean
          first_name: string
          id: string
          instagram_user: string | null
          invitation_code: string
          invitation_type: string
          invitation_url: string
          is_business_account: boolean | null
          is_professional_account: boolean | null
          last_name: string | null
          phone_country_code: string | null
          phone_number: string | null
          phone_verified: boolean | null
          project_id: string | null
          social_media_handle: string | null
          social_media_type: string | null
          stage_updated_at: string | null
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
      creator_quality: "low" | "medium" | "high"
      invitation_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "sended"
        | "in process"
      meta_verification_status: "review" | "accepted" | "rejected"
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
      creator_quality: ["low", "medium", "high"],
      invitation_status: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "sended",
        "in process",
      ],
      meta_verification_status: ["review", "accepted", "rejected"],
      notification_channel: ["sms", "email"],
      notification_status: ["sent", "failed", "pending"],
      notification_types: ["reminder", "notification", "alert"],
      task_status: ["pending", "in_progress", "completed", "review"],
      user_role: ["admin", "creator"],
    },
  },
} as const
