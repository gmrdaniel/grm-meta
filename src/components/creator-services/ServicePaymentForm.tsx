
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
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServicePaymentFormProps {
  creatorServiceId: string;
  onClose: () => void;
}

export function ServicePaymentForm({ creatorServiceId, onClose }: ServicePaymentFormProps) {
  const { toast } = useToast();
  const [isRecurring, setIsRecurring] = useState(false);
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

  useEffect(() => {
    async function checkServiceType() {
      const { data, error } = await supabase
        .from('creator_services')
        .select(`
          services (
            type
          )
        `)
        .eq('id', creatorServiceId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching service type:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo obtener la información del servicio.",
        });
        return;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró el servicio especificado.",
        });
        onClose();
        return;
      }

      setIsRecurring(data?.services?.type === 'recurrente');
    }

    checkServiceType();
  }, [creatorServiceId, onClose, toast]);

  async function onSubmit(values: PaymentFormValues) {
    console.log('Valores del formulario:', values);
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
      is_recurring: isRecurring,
    };

    console.log('Datos a guardar:', paymentData);

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
        <Tabs defaultValue="amounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="amounts">Montos</TabsTrigger>
            <TabsTrigger value="status">Estados de Pago</TabsTrigger>
            <TabsTrigger value="receipt">Comprobante</TabsTrigger>
          </TabsList>

          <TabsContent value="amounts" className="space-y-4 mt-4">
            <PaymentAmountFields form={form} />
          </TabsContent>

          <TabsContent value="status" className="space-y-4 mt-4">
            <PaymentStatusFields form={form} />
          </TabsContent>

          <TabsContent value="receipt" className="space-y-4 mt-4">
            <PaymentReceiptField form={form} />
          </TabsContent>
        </Tabs>

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
