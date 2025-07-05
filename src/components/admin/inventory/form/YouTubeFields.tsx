
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { CreatorFormValues } from "../form-schemas/creatorFormSchema";

interface YouTubeFieldsProps {
  form: UseFormReturn<CreatorFormValues>;
}

export function YouTubeFields({ form }: YouTubeFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="usuario_youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Youtube User</FormLabel>
              <FormControl>
                <Input placeholder="@user" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="seguidores_youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube Followers</FormLabel>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="elegible_youtube"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>YouTube Eligible</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="engagement_youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engagement YouTube (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="2.5" 
                  step="0.01"
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
