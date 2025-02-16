
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  total_amount: z.number().min(0, "El monto total debe ser mayor o igual a 0"),
  company_earning: z.number().min(0, "El monto de la empresa debe ser mayor o igual a 0"),
  creator_earning: z.number().min(0, "El monto del creador debe ser mayor o igual a 0"),
  brand_payment_status: z.enum(["pendiente", "pagado", "atrasado"]),
  creator_payment_status: z.enum(["pendiente", "pagado", "atrasado"]),
  brand_payment_date: z.date().optional(),
  creator_payment_date: z.date().optional(),
  payment_receipt: z.instanceof(File).optional(),
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
      brand_payment_status: "pendiente",
      creator_payment_status: "pendiente",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("brand_payment_status") === "pagado" && (
          <FormField
            control={form.control}
            name="brand_payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Pago de la Marca</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("creator_payment_status") === "pagado" && (
          <FormField
            control={form.control}
            name="creator_payment_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Pago al Creador</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
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
