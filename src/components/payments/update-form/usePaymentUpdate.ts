
import { useState } from "react";
import { PaymentFormValues, AUDIT_MODULE, AUDIT_TABLE_NAME, AUDIT_ACTION_TYPE } from "./PaymentFormSchema";
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
      console.log("Starting payment update process");
      console.log("Original payment data:", payment);
      console.log("Form values:", values);
      
      // Guardar datos anteriores para auditoría
      const previousData = {
        id: payment.id,
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
        creator_service_id: payment.creator_service_id,
        is_recurring: payment.is_recurring,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      };

      let payment_receipt_url = payment.payment_receipt_url;

      if (values.payment_receipt) {
        const fileExt = values.payment_receipt.name.split('.').pop();
        const fileName = `${payment.id}-${Date.now()}.${fileExt}`;

        // Verificar si el bucket de almacenamiento existe
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'payment_receipts');
        
        console.log('Storage buckets:', buckets);
        console.log('payment_receipts bucket exists:', bucketExists);
        
        if (!bucketExists) {
          console.log('Creating payment_receipts bucket');
          await supabase.storage.createBucket('payment_receipts', {
            public: false,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          });
        }

        console.log('Uploading payment receipt:', fileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(fileName, values.payment_receipt);

        if (uploadError) {
          console.error('Error uploading payment receipt:', uploadError);
          throw uploadError;
        }
        
        console.log('Upload successful:', uploadData);
        payment_receipt_url = uploadData.path;
      }

      const newData = {
        id: payment.id,
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
        creator_service_id: payment.creator_service_id,
        is_recurring: payment.is_recurring,
        created_at: payment.created_at,
        updated_at: new Date().toISOString()
      };

      // Actualizar pago
      console.log('Updating payment with data:', {
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
      });
      
      const { error: updateError } = await supabase
        .from(AUDIT_TABLE_NAME)
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

      if (updateError) {
        console.error('Error updating payment:', updateError);
        throw updateError;
      }

      console.log('Payment updated successfully');

      // Crear log de auditoría
      console.log('Creating audit log with data:', {
        recordId: payment.id,
        previousData,
        newData,
        tableName: AUDIT_TABLE_NAME,
        module: AUDIT_MODULE,
        actionType: AUDIT_ACTION_TYPE
      });
      
      const logCreated = await createAuditLog({
        recordId: payment.id,
        previousData,
        newData,
        tableName: AUDIT_TABLE_NAME,
        module: AUDIT_MODULE,
        actionType: AUDIT_ACTION_TYPE
      });
      
      console.log('Audit log creation result:', logCreated);

      toast.success("Pago actualizado exitosamente");
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar el pago:', error);
      toast.error("Error al actualizar el pago: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}
