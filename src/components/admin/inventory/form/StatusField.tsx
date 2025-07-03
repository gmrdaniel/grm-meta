
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CreatorFormValues } from "../form-schemas/creatorFormSchema";

interface StatusFieldProps {
  form: UseFormReturn<CreatorFormValues>;
}

export function StatusField({ form }: StatusFieldProps) {
  return (
    <FormField
      control={form.control}
      name="estatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="activo">Active</SelectItem>
              <SelectItem value="inactivo">Inactive</SelectItem>
              <SelectItem value="pendiente">Pending</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
