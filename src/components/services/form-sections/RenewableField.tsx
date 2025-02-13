
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";

interface RenewableFieldProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function RenewableField({ form }: RenewableFieldProps) {
  return (
    <FormField
      control={form.control}
      name="renewable"
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel>Renewable</FormLabel>
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
