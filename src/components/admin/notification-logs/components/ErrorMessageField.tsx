
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";

interface ErrorMessageFieldProps {
  control: Control<NotificationLogFormValues>;
}

export function ErrorMessageField({ control }: ErrorMessageFieldProps) {
  return (
    <FormField
      control={control}
      name="error_message"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Error Message</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter error message" 
              className="resize-none"
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}