
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "../ServiceForm";
import MDEditor from '@uiw/react-md-editor';

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
            <div data-color-mode="light">
              <MDEditor
                value={field.value}
                onChange={(value) => field.onChange(value || '')}
                height={400}
                preview="edit"
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
