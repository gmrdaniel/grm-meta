
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  creator_service_id: z.string().min(1, "Por favor selecciona un servicio"),
  total_amount: z.string().min(1, "El monto total es requerido"),
  company_earning: z.string().min(1, "La ganancia de la empresa es requerida"),
  creator_earning: z.string().min(1, "La ganancia del creador es requerida"),
  brand_payment_status: z.string().min(1, "El estado del pago de la marca es requerido"),
  creator_payment_status: z.string().min(1, "El estado del pago del creador es requerido"),
});

type FormValues = z.infer<typeof formSchema>;

interface ServicePaymentFormProps {
  onClose: () => void;
}

export function ServicePaymentForm({ onClose }: ServicePaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      creator_service_id: "",
      total_amount: "",
      company_earning: "",
      creator_earning: "",
      brand_payment_status: "pending",
      creator_payment_status: "pending",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase.from("service_payments").insert([
        {
          creator_service_id: values.creator_service_id,
          total_amount: parseFloat(values.total_amount),
          company_earning: parseFloat(values.company_earning),
          creator_earning: parseFloat(values.creator_earning),
          brand_payment_status: values.brand_payment_status,
          creator_payment_status: values.creator_payment_status,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente",
      });

      queryClient.invalidateQueries({ queryKey: ["service-payments"] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al registrar el pago",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="creator_service_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servicio del Creador</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Servicio 1</SelectItem>
                    <SelectItem value="2">Servicio 2</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Total</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
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
              <FormLabel>Ganancia Empresa</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
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
              <FormLabel>Ganancia Creador</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Pago Marca</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creator_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado Pago Creador</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  );
}
