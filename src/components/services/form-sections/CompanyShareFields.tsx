
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";

interface CompanyShareFieldsProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function CompanyShareFields({ form }: CompanyShareFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="company_share_min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Min Company Share (%)</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company_share_max"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Company Share (%)</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
