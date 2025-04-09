
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface NewNotificationSettingsProps {
  onSuccess?: () => void;
}

const formSchema = z.object({
  type: z.enum(["reminder", "notification", "alert"]),
  subject: z.string().optional().nullable(),
  message: z.string().min(5, "Message must be at least 5 characters"),
  channel: z.enum(["email", "sms"]),
  enabled: z.boolean().default(false),
  delay_days: z.number().min(0, "Delay cannot be negative"),
  frequency_days: z.number().min(0, "Frequency cannot be negative"),
  max_notifications: z.number().min(0, "Max notifications cannot be negative"),
  stage_id: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewNotificationSettings({ onSuccess }: NewNotificationSettingsProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "notification",
      subject: "",
      message: "",
      channel: "email",
      enabled: false,
      delay_days: 0,
      frequency_days: 0,
      max_notifications: 0,
      stage_id: null,
    },
  });

  const { data: projectStages, isLoading: loadingStages } = useQuery({
    queryKey: ['project-stages'],
    queryFn: fetchProjectStages,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const { error } = await supabase
        .from('notification_settings' as any)
        .insert([values as any]);
      
      if (error) throw error;
      
      toast.success("Notification setting created successfully");
      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error(`Failed to create notification setting: ${err.message}`);
    }
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select notification type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="notification">Notification</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="alert">Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The type/category of notification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How the notification will be delivered
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {form.watch("channel") === "email" && (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Enter email subject line" />
                    </FormControl>
                    <FormDescription>
                      Subject line for email notifications (not required for SMS)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Enter notification message"
                      className="min-h-[120px]" 
                    />
                  </FormControl>
                  <FormDescription>
                    Message content for the notification. You can use placeholders like {"{name}"} or {"{project}"}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stage_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Stage</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project stage (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all_stages">All Stages</SelectItem>
                      {projectStages?.map(stage => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The project stage this notification is associated with (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="delay_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        value={field.value} 
                      />
                    </FormControl>
                    <FormDescription>
                      Days to wait before sending
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency (Days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        value={field.value} 
                      />
                    </FormControl>
                    <FormDescription>
                      Days between repeat notifications (0 = once)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_notifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Count</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                        value={field.value} 
                      />
                    </FormControl>
                    <FormDescription>
                      Max number of notifications (0 = unlimited)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Enable Notification
                    </FormLabel>
                    <FormDescription>
                      Notifications will only be sent if enabled
                    </FormDescription>
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
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button type="submit">Create Notification Setting</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

async function fetchProjectStages() {
  const { data, error } = await supabase
    .from('project_stages')
    .select('id, name, project_id')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}
