
import { useState } from "react";
import { PaymentFormValues } from "./PaymentFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuditLog } from "./useAuditLog";

export function usePaymentUpdate(payment: any, onClose: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createAuditLog } = useAuditLog();

  const handleSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
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

      // Create audit log
      await createAuditLog({
        recordId: payment.id,
        previousData,
        newData,
        tableName: 'service_payments',
        module: 'payments',
        actionType: 'payment'
      });

      toast.success("Pago actualizado exitosamente");
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar el pago:', error);
      toast.error("Error al actualizar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
