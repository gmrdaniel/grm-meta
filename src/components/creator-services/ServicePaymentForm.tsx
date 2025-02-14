
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  total_amount: z.number().min(0, "El monto total debe ser mayor o igual a 0"),
  company_earning: z.number().min(0, "El monto de la empresa debe ser mayor o igual a 0"),
  creator_earning: z.number().min(0, "El monto del creador debe ser mayor o igual a 0"),
  brand_payment_status: z.enum(["pending", "completed"]),
  creator_payment_status: z.enum(["pending", "completed"]),
  is_recurring: z.boolean(),
  payment_period: z.enum(["monthly", "quarterly", "yearly"]).optional(),
  payment_receipt: z.instanceof(File).optional(),
  payment_month: z.string().optional(),
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
      brand_payment_status: "pending",
      creator_payment_status: "pending",
      is_recurring: false,
    },
  });

  const isRecurring = form.watch("is_recurring");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let payment_receipt_url = null;

    // Si hay un archivo de comprobante, subirlo primero
    if (values.payment_receipt) {
      const fileExt = values.payment_receipt.name.split('.').pop();
      const fileName = `${creatorServiceId}-${Date.now()}.${fileExt}`;

      const { data: fileData, error: uploadError } = await supabase.storage
        .from('payment_receipts')
        .upload(fileName, values.payment_receipt);

      if (uploadError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar el comprobante. Por favor intente nuevamente.",
        });
        return;
      }

      payment_receipt_url = fileData.path;
    }

    const paymentData = {
      creator_service_id: creatorServiceId,
      total_amount: values.total_amount,
      company_earning: values.company_earning,
      creator_earning: values.creator_earning,
      brand_payment_status: values.brand_payment_status,
      creator_payment_status: values.creator_payment_status,
      is_recurring: values.is_recurring,
      payment_period: values.payment_period,
      payment_month: values.payment_month,
      payment_receipt_url,
      brand_payment_date: values.brand_payment_status === "completed" ? new Date().toISOString() : null,
      creator_payment_date: values.creator_payment_status === "completed" ? new Date().toISOString() : null,
    };

    const { error } = await supabase.from("service_payments").insert(paymentData);

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

        <FormField
          control={form.control}
          name="brand_payment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Pago de la Marca</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione el estado" />
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
                    <SelectValue placeholder="Seleccione el estado" />
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
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Pago Recurrente</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && (
          <>
            <FormField
              control={form.control}
              name="payment_period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periodicidad</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione la periodicidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mes de Pago</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

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
                    if (file) {
                      onChange(file);
                    }
                  }}
                  {...field}
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
