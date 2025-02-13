
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceTypeFieldProps {
  form: UseFormReturn<ServiceFormValues>;
}

export function ServiceTypeField({ form }: ServiceTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Type</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="único">Único</SelectItem>
              <SelectItem value="recurrente">Recurrente</SelectItem>
              <SelectItem value="contrato">Contrato</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
