
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./schema";
import { DateSelector } from "./DateSelector";

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
      rules={{ required: "El mes de pago es requerido para servicios recurrentes" }}
      render={({ field }) => (
        <DateSelector field={field} label="Mes de Pago" />
      )}
    />
  );
}
