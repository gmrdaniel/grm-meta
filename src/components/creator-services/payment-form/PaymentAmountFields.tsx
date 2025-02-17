
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./schema";

interface PaymentAmountFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentAmountFields({ form }: PaymentAmountFieldsProps) {
  return (
    <>
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
    </>
  );
}
