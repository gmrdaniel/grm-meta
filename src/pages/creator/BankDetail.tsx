
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";
import { bankDetailsSchema, type BankDetailsFormValues } from "@/lib/schemas/bank-details";
import { supabase } from "@/integrations/supabase/client";

export default function CreatorBankDetail() {
  const { toast } = useToast();
  const form = useForm<BankDetailsFormValues>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      is_favorite: false,
    },
  });

  const watchCountry = form.watch("country");
  const watchPaymentMethod = form.watch("payment_method");
  const isPayPalOnly = !SUPPORTED_COUNTRIES.includes(watchCountry as any);

  const onSubmit = async (data: BankDetailsFormValues) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No se encontró el usuario");
      }

      // Ensure required fields are present
      if (!data.beneficiary_name || !data.country) {
        throw new Error("Faltan campos requeridos");
      }

      // Create the insert data object with required fields
      const insertData = {
        ...data,
        beneficiary_name: data.beneficiary_name,
        country: data.country,
        profile_id: user.id,
      };

      const { error } = await supabase
        .from("bank_details")
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Datos bancarios guardados",
        description: "Los datos bancarios se han guardado correctamente",
      });

      form.reset();
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un país" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[...SUPPORTED_COUNTRIES, "Otro"].map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
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
                                  <Building2 className="h-4 w-4" /> {/* Changed from Bank to Building2 */}
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

                  <FormField
                    control={form.control}
                    name="is_favorite"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Marcar como método de pago favorito</FormLabel>
                          <FormDescription>
                            Este será tu método de pago predeterminado
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

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
