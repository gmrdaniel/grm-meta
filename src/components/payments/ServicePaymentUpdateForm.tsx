
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
import { useAuth } from "@/hooks/useAuth";

// Accessing the Supabase URL and key from the client.ts constants
const SUPABASE_URL = "https://ovyakbwetiwkmpqjdhme.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92eWFrYndldGl3a21wcWpkaG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyMjkzMTksImV4cCI6MjA1NDgwNTMxOX0.2JIEJzWigGcyb46r7iK-H5PIwYK04SzWaKHb7ZZV2bw";

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
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    // Log userId on component mount to verify it's available
    console.log('Current user ID:', userId);
    console.log('Payment ID being edited:', payment.id);
  }, [userId, payment.id]);

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
      // Test direct database access
      const { data: testData, error: testError } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1);
      
      console.log('Database test query result:', { data: testData, error: testError });
      
      // Guardar los datos anteriores para auditoria
      const previousData = {
        total_amount: payment.total_amount,
        company_earning: payment.company_earning,
        creator_earning: payment.creator_earning,
        brand_payment_status: payment.brand_payment_status,
        creator_payment_status: payment.creator_payment_status,
        brand_payment_date: payment.brand_payment_date,
        creator_payment_date: payment.creator_payment_date,
        payment_receipt_url: payment.payment_receipt_url,
        payment_month: payment.payment_month,
        payment_period: payment.payment_period,
      };

      let payment_receipt_url = payment.payment_receipt_url;

      if (values.payment_receipt) {
        const fileExt = values.payment_receipt.name.split('.').pop();
        const fileName = `${payment.id}-${Date.now()}.${fileExt}`;

        // Check if the storage bucket exists, if not create it
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'payment_receipts');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('payment_receipts', {
            public: false,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          });
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(fileName, values.payment_receipt);

        if (uploadError) throw uploadError;
        payment_receipt_url = uploadData.path;
      }

      const newData = {
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
      };

      // Update payment
      const { error: updateError } = await supabase
        .from('service_payments')
        .update(newData)
        .eq('id', payment.id);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        throw updateError;
      }

      console.log('Payment updated successfully');

      // Create audit log with more detailed error handling
      if (userId) {
        console.log('Attempting to create audit log with user ID:', userId);
        console.log('Audit log data:', {
          _admin_id: userId,
          _action_type: 'payment',
          _module: 'payments',
          _table_name: 'service_payments',
          _record_id: payment.id,
          _previous_data: previousData,
          _new_data: newData,
          _revertible: true,
          _user_agent: navigator.userAgent
        });
        
        // Using fetch directly but with the constant URL and key instead of protected properties
        try {
          const rpcResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/insert_audit_log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({
              _admin_id: userId,
              _action_type: 'payment',
              _module: 'payments',
              _table_name: 'service_payments',
              _record_id: payment.id,
              _previous_data: previousData,
              _new_data: newData,
              _revertible: true,
              _ip_address: null,
              _user_agent: navigator.userAgent
            })
          });
          
          const rpcResult = await rpcResponse.json();
          console.log('Audit log direct fetch result:', rpcResult);
          console.log('Audit log HTTP status:', rpcResponse.status);
          
          if (!rpcResponse.ok) {
            console.error('Failed to create audit log via direct fetch:', rpcResult);
          } else {
            console.log('Audit log created successfully via direct fetch');
          }
        } catch (fetchError) {
          console.error('Fetch error creating audit log:', fetchError);
        }
      } else {
        console.warn('No user ID available for audit logging');
      }

      toast.success("Pago actualizado exitosamente");
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar el pago:', error);
      toast.error("Error al actualizar el pago");
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
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
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
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                    <SelectItem value="atrasado">Atrasado</SelectItem>
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
