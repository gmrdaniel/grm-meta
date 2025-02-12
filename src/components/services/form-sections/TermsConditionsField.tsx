
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";
import { Textarea } from "@/components/ui/textarea";

interface TermsConditionsFieldProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function TermsConditionsField({ form }: TermsConditionsFieldProps) {
  return (
    <FormField
      control={form.control}
      name="terms_conditions"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Terms & Conditions</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter terms and conditions here..."
              className="min-h-[200px] font-mono text-sm"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
