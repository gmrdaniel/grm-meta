
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CreatorFormValues } from "../form-schemas/creatorFormSchema";

interface OtherSocialFieldsProps {
  form: UseFormReturn<CreatorFormValues>;
}

export function OtherSocialFields({ form }: OtherSocialFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="usuario_pinterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pinterest User</FormLabel>
              <FormControl>
                <Input placeholder="@user" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seguidores_pinterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pinterest Followers</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="10000" 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="page_facebook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook page</FormLabel>
            <FormControl>
              <Input
                placeholder="https://facebook.com/page"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
