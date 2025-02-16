
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./schema";
import { DateSelector } from "./DateSelector";

interface PaymentStatusFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentStatusFields({ form }: PaymentStatusFieldsProps) {
  const brandPaymentStatus = form.watch("brand_payment_status");
  const creatorPaymentStatus = form.watch("creator_payment_status");

  return (
    <>
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

      {brandPaymentStatus === "pagado" && (
        <FormField
          control={form.control}
          name="brand_payment_date"
          render={({ field }) => (
            <DateSelector field={field} label="Fecha de Pago de la Marca" />
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

      {creatorPaymentStatus === "pagado" && (
        <>
          <FormField
            control={form.control}
            name="creator_payment_date"
            render={({ field }) => (
              <DateSelector field={field} label="Fecha de Pago al Creador" />
            )}
          />
          <FormField
            control={form.control}
            name="payment_receipt"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Comprobante de Pago (PDF)</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
                      }
                    }}
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}
