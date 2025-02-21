
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const paymentSchema = z.object({
  total_amount: z.number().min(0),
  company_earning: z.number().min(0),
  creator_earning: z.number().min(0),
  brand_payment_status: z.string(),
  creator_payment_status: z.string(),
  brand_payment_date: z.date().nullable(),
  creator_payment_date: z.date().nullable(),
  payment_receipt: z.instanceof(File).optional(),
  payment_month: z.date().nullable()
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface ServicePaymentUpdateFormProps {
  payment: any;
  onClose: () => void;
}

export function ServicePaymentUpdateForm({ payment, onClose }: ServicePaymentUpdateFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      total_amount: payment.total_amount,
      company_earning: payment.company_earning,
      creator_earning: payment.creator_earning,
      brand_payment_status: payment.brand_payment_status,
      creator_payment_status: payment.creator_payment_status,
      brand_payment_date: payment.brand_payment_date ? new Date(payment.brand_payment_date) : null,
      creator_payment_date: payment.creator_payment_date ? new Date(payment.creator_payment_date) : null,
      payment_month: payment.payment_month ? new Date(payment.payment_month) : null,
    },
  });

  useEffect(() => {
    // Actualizar el creator_earning cuando cambie total_amount o company_earning
    const subscription = form.watch((value, { name }) => {
      if (name === "total_amount" || name === "company_earning") {
        const total = form.getValues("total_amount");
        const company = form.getValues("company_earning");
        form.setValue("creator_earning", total - company);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (values: PaymentFormValues) => {
    try {
      let payment_receipt_url = payment.payment_receipt_url;

      if (values.payment_receipt) {
        const fileExt = values.payment_receipt.name.split('.').pop();
        const fileName = `${payment.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(fileName, values.payment_receipt);

        if (uploadError) throw uploadError;
        payment_receipt_url = uploadData.path;
      }

      const { error } = await supabase
        .from('service_payments')
        .update({
          total_amount: values.total_amount,
          company_earning: values.company_earning,
          creator_earning: values.creator_earning,
          brand_payment_status: values.brand_payment_status,
          creator_payment_status: values.creator_payment_status,
          brand_payment_date: values.brand_payment_date?.toISOString(),
          creator_payment_date: values.creator_payment_date?.toISOString(),
          payment_receipt_url,
          payment_month: values.payment_month?.toISOString(),
          payment_period: values.payment_month ? format(values.payment_month, 'MMMM yyyy') : null,
        })
        .eq('id', payment.id);

      if (error) throw error;

      toast.success("Pago actualizado exitosamente");
      onClose();
    } catch (error: any) {
      toast.error("Error al actualizar el pago");
      console.error('Error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {payment.is_recurring && (
          <FormField
            control={form.control}
            name="payment_month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mes de Pago</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto Total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
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
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
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
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                  disabled
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand_payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado Pago Marca</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creator_payment_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado Pago Creador</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="brand_payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Pago Marca</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="creator_payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Pago Creador</FormLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="payment_receipt"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Comprobante de Pago (PDF)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onChange(file);
                  }}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Form>
  );
}
