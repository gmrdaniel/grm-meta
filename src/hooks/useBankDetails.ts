
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { bankDetailsSchema, type BankDetailsFormValues } from "@/lib/schemas/bank-details";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveCountries } from "@/services/countryService";
import { SUPPORTED_BANK_TRANSFER_COUNTRIES } from "@/lib/constants/supported-bank-countries";

export const useBankDetails = () => {
  const { toast } = useToast();
  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      payment_method: "bank_transfer",
      country: "",
      beneficiary_name: "",
      clabe: "",
    },
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getActiveCountries,
  });

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }
        if (!user) {
          console.log('No user found');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error getting profile:', profileError);
          return;
        }
        if (!profile) {
          console.log('No profile found');
          return;
        }

        console.log('Fetching bank details for profile:', profile.id);
        const { data: bankDetails, error: bankDetailsError } = await supabase
          .from('bank_details')
          .select('*')
          .eq('profile_id', profile.id)
          .maybeSingle();

        if (bankDetailsError) {
          console.error('Error loading bank details:', bankDetailsError);
          return;
        }

        if (bankDetails) {
          console.log('Bank details loaded:', bankDetails);
          form.reset({
            country: bankDetails.country || "",
            payment_method: bankDetails.payment_method || "bank_transfer",
            beneficiary_name: bankDetails.beneficiary_name || "",
            bank_account_number: bankDetails.bank_account_number || "",
            iban: bankDetails.iban || "",
            swift_bic: bankDetails.swift_bic || "",
            bank_name: bankDetails.bank_name || "",
            bank_address: bankDetails.bank_address || "",
            routing_number: bankDetails.routing_number || "",
            clabe: bankDetails.clabe || "",
            paypal_email: bankDetails.paypal_email || "",
          });
        } else {
          console.log('No bank details found for this user');
        }
      } catch (error) {
        console.error('Error in loadBankDetails:', error);
      }
    };

    loadBankDetails();
  }, [form]);

  const watchCountry = form.watch("country");
  const watchPaymentMethod = form.watch("payment_method");
  
  // Actualizada la lógica para determinar si solo se permite PayPal
  const isPayPalOnly = !SUPPORTED_BANK_TRANSFER_COUNTRIES.includes(watchCountry as any);

  // Si el país seleccionado no permite transferencia bancaria, forzar PayPal
  useEffect(() => {
    if (isPayPalOnly && watchPaymentMethod === "bank_transfer") {
      form.setValue("payment_method", "paypal");
    }
  }, [watchCountry, isPayPalOnly, form, watchPaymentMethod]);

  const onSubmit = async (data: BankDetailsFormValues) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) {
        throw new Error("No se encontró el usuario");
      }

      const bankDetails = {
        ...data,
        beneficiary_name: data.beneficiary_name || "",
        country: data.country || "",
        payment_method: data.payment_method || "bank_transfer",
        profile_id: user.id,
      };

      console.log('Saving bank details:', bankDetails);
      const { data: existingRecord, error: searchError } = await supabase
        .from('bank_details')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (searchError) throw searchError;

      let result;
      if (existingRecord) {
        result = await supabase
          .from('bank_details')
          .update(bankDetails)
          .eq('profile_id', user.id);
      } else {
        result = await supabase
          .from('bank_details')
          .insert(bankDetails);
      }

      if (result.error) throw result.error;

      toast({
        title: existingRecord ? "Datos bancarios actualizados" : "Datos bancarios guardados",
        description: existingRecord 
          ? "Los datos bancarios se han actualizado correctamente"
          : "Los datos bancarios se han guardado correctamente",
      });
    } catch (error) {
      console.error("Error saving bank details:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al guardar los datos bancarios",
      });
    }
  };

  return {
    form,
    countries,
    isLoadingCountries,
    watchCountry,
    watchPaymentMethod,
    isPayPalOnly,
    onSubmit,
  };
};
