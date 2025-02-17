
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PaymentAmountFields } from "./payment-form/PaymentAmountFields";
import { PaymentStatusFields } from "./payment-form/PaymentStatusFields";
import { PaymentReceiptField } from "./payment-form/PaymentReceiptField";
import { PaymentMonthField } from "./payment-form/PaymentMonthField";
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
      brand_payment_date: null,
      creator_payment_date: null,
      payment_month: null,
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

      const isServiceRecurring = data?.services?.type === 'recurrente';
      setIsRecurring(isServiceRecurring);
      
      if (!isServiceRecurring) {
        form.setValue('payment_month', null);
      }
    }

    checkServiceType();
  }, [creatorServiceId, onClose, toast, form]);

  async function onSubmit(values: PaymentFormValues) {
    try {
      if (isRecurring && !values.payment_month) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Debe seleccionar un mes de pago para servicios recurrentes.",
        });
        return;
      }

      console.log('Valores del formulario antes de procesar:', values);
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
        payment_month: values.payment_month?.toISOString() || null,
      };

      console.log('Datos a guardar en la BD:', paymentData);

      const { error } = await supabase.from("service_payments").insert(paymentData);

      if (error) {
        let errorMessage = "No se pudo registrar el pago. Por favor intente nuevamente.";
        
        if (error.code === '23505') {
          errorMessage = "Ya existe un pago registrado para este mes y servicio.";
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
        console.error("Error registering payment:", error);
        return;
      }

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente.",
      });
      onClose();
    } catch (error) {
      console.error("Error en el proceso de registro de pago:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error inesperado. Por favor intente nuevamente.",
      });
    }
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
            {isRecurring && (
              <PaymentMonthField form={form} isRecurring={isRecurring} />
            )}
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
