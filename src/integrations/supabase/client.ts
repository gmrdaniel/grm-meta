
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://cyzrcfumjijffbzzrmia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5enJjZnVtamlqZmZienpybWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTAzNTIsImV4cCI6MjA1OTYyNjM1Mn0.Ub4ksQsvqC4qd8dR-v1YYaDGdHV_1mCo1MgaUSATGvo";

// Define temporary database types until the generated ones work
export interface TempDatabase {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          role: 'admin' | 'creator';
          profile_photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role: 'admin' | 'creator';
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          role?: 'admin' | 'creator';
          profile_photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          profile_id: string;
          message: string;
          type: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          message: string;
          type: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          message?: string;
          type?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      creator_invitations: {
        Row: {
          id: string;
          project_id: string | null;
          email: string;
          full_name: string;
          social_media_type: string | null;
          social_media_handle: string | null;
          other_social_media: string | null;
          youtube_channel: string | null;
          instagram_user: string | null;
          facebook_page: string | null;
          invitation_code: string;
          invitation_url: string;
          status: 'pending' | 'in process' | 'rejected' | 'completed' | 'sended';
          invitation_type: string;
          created_at: string;
          updated_at: string;
          phone_number: string | null;
          phone_country_code: string | null;
          phone_verified: boolean | null;
          current_stage_id: string | null;
          fb_step_completed: boolean;
          is_professional_account: boolean | null;
          is_business_account: boolean | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          email: string;
          full_name: string;
          social_media_type?: string | null;
          social_media_handle?: string | null;
          other_social_media?: string | null;
          youtube_channel?: string | null;
          instagram_user?: string | null;
          facebook_page?: string | null;
          invitation_code: string;
          invitation_url: string;
          status?: 'pending' | 'in process' | 'rejected' | 'completed' | 'sended';
          invitation_type: string;
          created_at?: string;
          updated_at?: string;
          phone_number?: string | null;
          phone_country_code?: string | null;
          phone_verified?: boolean | null;
          current_stage_id?: string | null;
          fb_step_completed?: boolean;
          is_professional_account?: boolean | null;
          is_business_account?: boolean | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          email?: string;
          full_name?: string;
          social_media_type?: string | null;
          social_media_handle?: string | null;
          other_social_media?: string | null;
          youtube_channel?: string | null;
          instagram_user?: string | null;
          facebook_page?: string | null;
          invitation_code?: string;
          invitation_url?: string;
          status?: 'pending' | 'in process' | 'rejected' | 'completed' | 'sended';
          invitation_type?: string;
          created_at?: string;
          updated_at?: string;
          phone_number?: string | null;
          phone_country_code?: string | null;
          phone_verified?: boolean | null;
          current_stage_id?: string | null;
          fb_step_completed?: boolean;
          is_professional_account?: boolean | null;
          is_business_account?: boolean | null;
        };
      };
      bulk_creator_invitations: {
        Row: {
          id: string;
          file_name: string;
          status: string;
          total_rows: number;
          processed_rows: number | null;
          failed_rows: number | null;
          created_by: string;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          file_name: string;
          status: string;
          total_rows: number;
          processed_rows?: number | null;
          failed_rows?: number | null;
          created_by: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          file_name?: string;
          status?: string;
          total_rows?: number;
          processed_rows?: number | null;
          failed_rows?: number | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      bulk_creator_invitation_details: {
        Row: {
          id: string;
          bulk_invitation_id: string;
          full_name: string;
          email: string;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bulk_invitation_id: string;
          full_name: string;
          email: string;
          status: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bulk_invitation_id?: string;
          full_name?: string;
          email?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
      creator_inventory: {
        Row: {
          id: string;
          nombre: string;
          apellido: string;
          correo: string;
          telefono: string | null;
          lada_telefono: string | null;
          usuario_tiktok: string | null;
          usuario_pinterest: string | null;
          page_facebook: string | null;
          estatus: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          apellido: string;
          correo: string;
          telefono?: string | null;
          lada_telefono?: string | null;
          usuario_tiktok?: string | null;
          usuario_pinterest?: string | null;
          page_facebook?: string | null;
          estatus?: string;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          apellido?: string;
          correo?: string;
          telefono?: string | null;
          lada_telefono?: string | null;
          usuario_tiktok?: string | null;
          usuario_pinterest?: string | null;
          page_facebook?: string | null;
          estatus?: string;
          fecha_creacion?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_stages: {
        Row: {
          id: string;
          name: string;
          project_id: string;
          order_index: number;
          responsible: string;
          url: string;
          view: string;
          response_positive: string | null;
          response_negative: string | null;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          project_id: string;
          order_index: number;
          responsible: string;
          url: string;
          view: string;
          response_positive?: string | null;
          response_negative?: string | null;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          project_id?: string;
          order_index?: number;
          responsible?: string;
          url?: string;
          view?: string;
          response_positive?: string | null;
          response_negative?: string | null;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_invitation_by_code: {
        Args: {
          code_param: string;
        };
        Returns: {
          id: string;
          project_id: string | null;
          email: string;
          full_name: string;
          social_media_type: string | null;
          social_media_handle: string | null;
          other_social_media: string | null;
          youtube_channel: string | null;
          instagram_user: string | null;
          facebook_page: string | null;
          invitation_code: string;
          invitation_url: string;
          status: 'pending' | 'in process' | 'rejected' | 'completed' | 'sended';
          invitation_type: string;
          created_at: string;
          updated_at: string;
          phone_number: string | null;
          phone_country_code: string | null;
          phone_verified: boolean | null;
          current_stage_id: string | null;
          fb_step_completed: boolean;
          is_professional_account: boolean | null;
          is_business_account: boolean | null;
        }[];
      };
      update_stages_order: {
        Args: {
          stages_data: any[];
        };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: 'admin' | 'creator';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Export the Supabase client and related functions
export const supabase = createClient<TempDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper function to find invitation by code
export const findInvitationByCode = (code: string) => {
  return supabase.rpc('find_invitation_by_code', { code_param: code });
};
