import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CreditCard } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { bankDetailsSchema, type BankDetailsFormValues } from "@/lib/schemas/bank-details";
import { supabase } from "@/integrations/supabase/client";
import { getActiveCountries, type Country } from "@/services/countryService";
import { useQuery } from "@tanstack/react-query";

export default function CreatorBankDetail() {
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

  const renderBankFields = () => {
    if (watchPaymentMethod !== "bank_transfer") return null;

    switch (watchCountry) {
      case "Estados Unidos de América":
        return (
          <>
            <FormField
              control={form.control}
              name="routing_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código ABA (número de ruta)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cuenta bancaria</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "México":
        return (
          <FormField
            control={form.control}
            name="clabe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CLABE (18 dígitos)</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={18} />
                </FormControl>
                <FormDescription>
                  Clave Bancaria Estandarizada de 18 dígitos
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "Reino Unido":
        return (
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <>
            <FormField
              control={form.control}
              name="bank_account_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de cuenta bancaria</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="swift_bic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código SWIFT/BIC</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Datos bancarios</h1>
            <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País de destino</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isLoadingCountries}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country.id} value={country.name_es}>
                                {country.name_es}
                              </SelectItem>
                            ))}
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watchCountry}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un método de pago" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!isPayPalOnly && (
                              <SelectItem value="bank_transfer">
                                <span className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Transferencia Bancaria
                                </span>
                              </SelectItem>
                            )}
                            <SelectItem value="paypal">
                              <span className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                PayPal
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="beneficiary_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo del beneficiario</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchPaymentMethod === "bank_transfer" && renderBankFields()}

                  {watchPaymentMethod === "paypal" && (
                    <FormField
                      control={form.control}
                      name="paypal_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico de PayPal</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button type="submit" className="w-full">
                    Guardar datos bancarios
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
