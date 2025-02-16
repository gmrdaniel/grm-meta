
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
import { Label } from "@/components/ui/label";

const paymentSchema = z.object({
  company_earning: z.number().min(0),
  creator_earning: z.number().min(0),
  brand_payment_status: z.string(),
  creator_payment_status: z.string(),
  payment_receipt: z.instanceof(File).optional(),
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
      let payment_receipt_url = null;

      // Si hay un archivo PDF para subir y el pago al creador está marcado como pagado
      if (data.payment_receipt && data.creator_payment_status === 'pagado') {
        const fileExt = data.payment_receipt.name.split('.').pop();
        const fileName = `${payment.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(fileName, data.payment_receipt);

        if (uploadError) throw uploadError;
        payment_receipt_url = fileName;
      }

      const { error } = await supabase
        .from('service_payments')
        .update({
          company_earning: data.company_earning,
          creator_earning: data.creator_earning,
          brand_payment_status: data.brand_payment_status,
          creator_payment_status: data.creator_payment_status,
          brand_payment_date: data.brand_payment_status === 'pagado' ? new Date().toISOString() : null,
          creator_payment_date: data.creator_payment_status === 'pagado' ? new Date().toISOString() : null,
          ...(payment_receipt_url && { payment_receipt_url }),
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("creator_payment_status") === "pagado" && (
          <div className="space-y-2">
            <Label htmlFor="payment_receipt">Comprobante de Pago (PDF)</Label>
            <Input
              id="payment_receipt"
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  form.setValue("payment_receipt", file);
                }
              }}
            />
          </div>
        )}

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
