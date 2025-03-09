
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CreatorDetail {
  id: string;
  email: string | null;
  created_at: string;
  personal_data?: {
    first_name: string | null;
    last_name: string | null;
    instagram_username: string | null;
    birth_date: string | null;
    country_of_residence: string | null;
    state_of_residence: string | null;
    phone_number: string | null;
    country_code: string | null; // Ensure country_code is included
    gender: string | null;
    category_id: string | null;
    categories?: {
      id: string;
      name: string;
      status: string;
    } | null;
  };
  bank_details?: {
    beneficiary_name: string;
    payment_method: "bank_transfer" | "paypal";
    country: string;
    bank_account_number: string | null;
    iban: string | null;
    swift_bic: string | null;
    bank_name: string | null;
    bank_address: string | null;
    routing_number: string | null;
    clabe: string | null;
    paypal_email: string | null;
  };
}

export const useCreatorDetail = (creatorId: string | undefined) => {
  const [creator, setCreator] = useState<CreatorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (creatorId) {
      fetchCreatorDetail(creatorId);
    }
  }, [creatorId]);

  async function fetchCreatorDetail(id: string) {
    try {
      const { data: emailData, error: emailError } = await supabase
        .rpc('get_user_email', { user_id: id });

      if (emailError) throw emailError;

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          created_at,
          personal_data (
            first_name,
            last_name,
            instagram_username,
            birth_date,
            country_of_residence,
            state_of_residence,
            phone_number,
            country_code,
            gender,
            category_id,
            categories (id, name, status)
          ),
          bank_details (
            beneficiary_name,
            payment_method,
            country,
            bank_account_number,
            iban,
            swift_bic,
            bank_name,
            bank_address,
            routing_number,
            clabe,
            paypal_email
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Log received data for debugging
      console.log("Creator detail data:", data);

      // Make sure data is properly structured before setting it as state
      if (data) {
        const personalData = data.personal_data || {
          first_name: null,
          last_name: null,
          instagram_username: null,
          birth_date: null,
          country_of_residence: null,
          state_of_residence: null,
          phone_number: null,
          country_code: null,
          gender: null,
          category_id: null,
          categories: null
        };

        setCreator({ 
          ...data, 
          email: emailData,
          personal_data: personalData
        });
      }
    } catch (error: any) {
      toast.error("Error fetching creator details");
      console.error("Error:", error.message);
    } finally {
      setLoading(false);
    }
  }

  return { creator, loading };
};
