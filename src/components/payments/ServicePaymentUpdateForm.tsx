
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { AmountFields } from "./update-form/AmountFields";
import { PaymentStatusFields } from "./update-form/PaymentStatusFields";
import { PaymentReceiptField } from "./update-form/PaymentReceiptField";
import { PaymentMonthField } from "./update-form/PaymentMonthField";
import { FormActions } from "./update-form/FormActions";
import { paymentSchema, PaymentFormValues } from "./update-form/PaymentFormSchema";
import { usePaymentUpdate } from "./update-form/usePaymentUpdate";
import { supabase } from "@/integrations/supabase/client";

interface ServicePaymentUpdateFormProps {
  payment: any;
  onClose: () => void;
  onUpdate?: (paymentId: string, previousData: any, updatedPayment: any) => Promise<void>;
}

export function ServicePaymentUpdateForm({ payment, onClose, onUpdate }: ServicePaymentUpdateFormProps) {
  const { handleSubmit, isSubmitting } = usePaymentUpdate(payment, onClose, onUpdate);

  useEffect(() => {
    // Verificar sesión al cargar el componente
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log('Current session when editing payment:', data.session?.user?.id);
    };
    checkSession();
  }, []);

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <PaymentMonthField 
          form={form} 
          isRecurring={payment.is_recurring} 
        />
        
        <AmountFields form={form} />
        
        <PaymentStatusFields form={form} />
        
        <PaymentReceiptField form={form} />
        
        <FormActions 
          onClose={onClose} 
          isSubmitting={isSubmitting} 
        />
      </form>
    </Form>
  );
}
