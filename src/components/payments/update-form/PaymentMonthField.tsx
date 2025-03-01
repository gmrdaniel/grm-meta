
import React from "react";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";

interface PaymentMonthFieldProps {
  form: UseFormReturn<PaymentFormValues>;
  isRecurring: boolean;
}

export function PaymentMonthField({ form, isRecurring }: PaymentMonthFieldProps) {
  if (!isRecurring) return null;
  
  return (
    <FormField
      control={form.control}
      name="payment_month"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mes de Pago</FormLabel>
          <DatePicker
            value={field.value}
            onChange={field.onChange}
          />
        </FormItem>
      )}
    />
  );
}
