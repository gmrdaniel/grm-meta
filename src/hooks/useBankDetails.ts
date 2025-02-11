
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { bankDetailsSchema, type BankDetailsFormValues } from "@/lib/schemas/bank-details";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActiveCountries } from "@/services/countryService";

export const useBankDetails = () => {
  const { toast } = useToast();
  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      payment_method: "bank_transfer",
    },
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getActiveCountries,
  });

  useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!profiles) return;

        const { data: bankDetails } = await supabase
          .from('bank_details')
          .select('*')
          .eq('profile_id', profiles.id)
          .single();

        if (bankDetails) {
          form.reset(bankDetails);
        }
      } catch (error) {
        console.error('Error loading bank details:', error);
      }
    };

    loadBankDetails();
  }, [form]);

  const watchCountry = form.watch("country");
  const watchPaymentMethod = form.watch("payment_method");
  const isPayPalOnly = !countries.some(country => country.name_es === watchCountry);

  const onSubmit = async (data: BankDetailsFormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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

      const { data: existingRecord } = await supabase
        .from('bank_details')
        .select('id')
        .eq('profile_id', user.id)
        .single();

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
