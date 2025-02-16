
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./schema";
import { DateSelector } from "./DateSelector";

interface PaymentStatusFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentStatusFields({ form }: PaymentStatusFieldsProps) {
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

      {form.watch("brand_payment_status") === "pagado" && (
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

      {form.watch("creator_payment_status") === "pagado" && (
        <FormField
          control={form.control}
          name="creator_payment_date"
          render={({ field }) => (
            <DateSelector field={field} label="Fecha de Pago al Creador" />
          )}
        />
      )}
    </>
  );
}
