
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";

interface FeesAndDurationFieldsProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function FeesAndDurationFields({ form }: FeesAndDurationFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="fixed_fee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fixed Fee ($)</FormLabel>
            <FormControl>
              <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="max_revenue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Revenue ($)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="contract_duration"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Duration (months)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                {...field} 
                onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
