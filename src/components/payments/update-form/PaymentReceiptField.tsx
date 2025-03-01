
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";

interface PaymentReceiptFieldProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function PaymentReceiptField({ form }: PaymentReceiptFieldProps) {
  return (
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
                if (file) onChange(file);
              }}
              {...field}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
