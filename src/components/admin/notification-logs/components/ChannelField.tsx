
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { NotificationLogFormValues } from "../schemas/notificationLogFormSchema";

interface ChannelFieldProps {
  control: Control<NotificationLogFormValues>;
}

export function ChannelField({ control }: ChannelFieldProps) {
  return (
    <FormField
      control={control}
      name="channel"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Channel</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
