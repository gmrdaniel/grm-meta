
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, CreditCard } from "lucide-react";
import { type UseFormReturn } from "react-hook-form";
import { type BankDetailsFormValues } from "@/lib/schemas/bank-details";

interface PaymentMethodFieldProps {
  form: UseFormReturn<BankDetailsFormValues>;
  isPayPalOnly: boolean;
  watchCountry: string;
}

export function PaymentMethodField({ form, isPayPalOnly, watchCountry }: PaymentMethodFieldProps) {
  return (
    <FormField
      control={form.control}
      name="payment_method"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Método de pago</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value || ""}
            disabled={!watchCountry || (isPayPalOnly && field.value === "paypal")}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un método de pago" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {!isPayPalOnly && (
                <SelectItem value="bank_transfer">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Transferencia Bancaria
                  </span>
                </SelectItem>
              )}
              <SelectItem value="paypal">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  PayPal
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
