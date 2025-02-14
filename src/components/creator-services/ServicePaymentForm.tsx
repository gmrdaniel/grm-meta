
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  total_amount: z.number().min(0, "El monto total debe ser mayor o igual a 0"),
  company_earning: z.number().min(0, "El monto de la empresa debe ser mayor o igual a 0"),
  creator_earning: z.number().min(0, "El monto del creador debe ser mayor o igual a 0"),
});

interface ServicePaymentFormProps {
  creatorServiceId: string;
  onClose: () => void;
}

export function ServicePaymentForm({ creatorServiceId, onClose }: ServicePaymentFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      total_amount: 0,
      company_earning: 0,
      creator_earning: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { error } = await supabase.from("service_payments").insert({
      creator_service_id: creatorServiceId,
      total_amount: values.total_amount,
      company_earning: values.company_earning,
      creator_earning: values.creator_earning,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el pago. Por favor intente nuevamente.",
      });
      console.error("Error registering payment:", error);
      return;
    }

    toast({
      title: "Pago registrado",
      description: "El pago ha sido registrado exitosamente.",
    });
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Total</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company_earning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Empresa</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creator_earning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Creador</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Pago</Button>
        </div>
      </form>
    </Form>
  );
}
