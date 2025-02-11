
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type UseFormReturn } from "react-hook-form";
import { type BankDetailsFormValues } from "@/lib/schemas/bank-details";

interface PayPalFieldProps {
  form: UseFormReturn<BankDetailsFormValues>;
}

export function PayPalField({ form }: PayPalFieldProps) {
  return (
    <FormField
      control={form.control}
      name="paypal_email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Correo electrónico de PayPal</FormLabel>
          <FormControl>
            <Input type="email" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
