
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const paymentSchema = z.object({
  company_earning: z.number().min(0),
  creator_earning: z.number().min(0),
  brand_payment_status: z.string(),
  creator_payment_status: z.string(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface ServicePaymentUpdateFormProps {
  payment: {
    id: string;
    company_earning: number;
    creator_earning: number;
    brand_payment_status: string;
    creator_payment_status: string;
  };
  onClose: () => void;
}

export function ServicePaymentUpdateForm({ payment, onClose }: ServicePaymentUpdateFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      company_earning: payment.company_earning,
      creator_earning: payment.creator_earning,
      brand_payment_status: payment.brand_payment_status,
      creator_payment_status: payment.creator_payment_status,
    },
  });

  async function onSubmit(data: PaymentFormValues) {
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('service_payments')
        .update({
          company_earning: data.company_earning,
          creator_earning: data.creator_earning,
          brand_payment_status: data.brand_payment_status,
          creator_payment_status: data.creator_payment_status,
          brand_payment_date: data.brand_payment_status === 'completed' ? new Date().toISOString() : null,
          creator_payment_date: data.creator_payment_status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast({
        title: "Pago actualizado",
        description: "El pago ha sido actualizado exitosamente.",
      });
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al actualizar el pago.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_earning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Empresa</FormLabel>
              <FormControl>
                <Input
                  type="number"
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
          name="brand_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Pago de la Marca</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="creator_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Pago al Creador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : "Guardar Pago"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
