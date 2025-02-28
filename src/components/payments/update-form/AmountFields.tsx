
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentFormSchema";

interface AmountFieldsProps {
  form: UseFormReturn<PaymentFormValues>;
}

export function AmountFields({ form }: AmountFieldsProps) {
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
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company_earning"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ganancia Empresa</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="creator_earning"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ganancia Creador</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={e => field.onChange(Number(e.target.value))}
                disabled
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
