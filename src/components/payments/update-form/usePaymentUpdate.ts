
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaymentFormValues } from "./PaymentFormSchema";
import { useAuditLog } from "./useAuditLog";

export function usePaymentUpdate(
  payment: any, 
  onClose: () => void,
  onUpdate?: (paymentId: string, previousData: any, updatedPayment: any) => Promise<void>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { logPaymentUpdate } = useAuditLog();

  const handleSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating payment:", payment.id, values);
      
      let payment_receipt_url = payment.payment_receipt_url;

      // Si hay un nuevo archivo, subir a storage
      if (values.payment_receipt instanceof File) {
        const fileExt = values.payment_receipt.name.split('.').pop();
        const fileName = `${payment.id}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(fileName, values.payment_receipt);

        if (uploadError) {
          throw new Error(`Error uploading payment receipt: ${uploadError.message}`);
        }

        payment_receipt_url = uploadData.path;
      }

      // Construir el objeto de actualización
      const updateData = {
        total_amount: values.total_amount,
        company_earning: values.company_earning,
        creator_earning: values.creator_earning,
        brand_payment_status: values.brand_payment_status,
        creator_payment_status: values.creator_payment_status,
        payment_receipt_url,
        brand_payment_date: values.brand_payment_date ? values.brand_payment_date.toISOString() : null,
        creator_payment_date: values.creator_payment_date ? values.creator_payment_date.toISOString() : null,
        payment_month: values.payment_month ? values.payment_month.toISOString() : null,
      };

      // Guardar el estado anterior para el registro de auditoría
      const previousData = {
        total_amount: payment.total_amount,
        company_earning: payment.company_earning,
        creator_earning: payment.creator_earning,
        brand_payment_status: payment.brand_payment_status,
        creator_payment_status: payment.creator_payment_status,
        payment_receipt_url: payment.payment_receipt_url,
        brand_payment_date: payment.brand_payment_date,
        creator_payment_date: payment.creator_payment_date,
        payment_month: payment.payment_month
      };

      // Actualizar el pago
      const { error: updateError } = await supabase
        .from('service_payments')
        .update(updateData)
        .eq('id', payment.id);

      if (updateError) {
        throw new Error(`Error updating payment: ${updateError.message}`);
      }

      // Registrar el cambio en el log de auditoría
      await logPaymentUpdate(payment.id, previousData, updateData);
      
      // Si hay una función onUpdate proporcionada, llamarla
      if (onUpdate) {
        await onUpdate(payment.id, previousData, updateData);
      }

      toast({
        title: "Payment updated",
        description: "The payment has been updated successfully.",
      });

      onClose();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}
