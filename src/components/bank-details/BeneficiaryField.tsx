
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type UseFormReturn } from "react-hook-form";
import { type BankDetailsFormValues } from "@/lib/schemas/bank-details";

interface BeneficiaryFieldProps {
  form: UseFormReturn<BankDetailsFormValues>;
}

export function BeneficiaryField({ form }: BeneficiaryFieldProps) {
  return (
    <FormField
      control={form.control}
      name="beneficiary_name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre completo del beneficiario</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
