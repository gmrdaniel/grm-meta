
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentAmountFields } from "./payment-form/PaymentAmountFields";
import { PaymentStatusFields } from "./payment-form/PaymentStatusFields";
import { PaymentReceiptField } from "./payment-form/PaymentReceiptField";
import { paymentFormSchema, type PaymentFormValues } from "./payment-form/schema";

interface ServicePaymentFormProps {
  creatorServiceId: string;
  onClose: () => void;
}

export function ServicePaymentForm({ creatorServiceId, onClose }: ServicePaymentFormProps) {
  const { toast } = useToast();
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      total_amount: 0,
      company_earning: 0,
      creator_earning: 0,
      brand_payment_status: "pendiente",
      creator_payment_status: "pendiente",
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    let payment_receipt_url = null;

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
      payment_receipt_url,
      brand_payment_date: values.brand_payment_date?.toISOString() || null,
      creator_payment_date: values.creator_payment_date?.toISOString() || null,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-[calc(100vh-120px)] overflow-y-auto pr-4">
        <PaymentAmountFields form={form} />
        <PaymentStatusFields form={form} />
        <PaymentReceiptField form={form} />

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Guardar Pago</Button>
        </div>
      </form>
    </Form>
  );
}
