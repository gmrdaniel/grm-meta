
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NotificationSetting } from "../notification-settings/types";
import { Loader2 } from "lucide-react";

interface EditNotificationSettingsProps {
  setting: NotificationSetting;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditNotificationSettings({
  setting,
  onSuccess,
  onCancel,
}: EditNotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      type: setting.type,
      subject: setting.subject || "",
      message: setting.message,
      channel: setting.channel,
      enabled: setting.enabled,
      delay_days: setting.delay_days,
      frequency_days: setting.frequency_days,
      max_notifications: setting.max_notifications,
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('notification_settings' as any)
        .update({
          type: data.type,
          subject: data.subject || null,
          message: data.message,
          channel: data.channel,
          enabled: data.enabled,
          delay_days: data.delay_days,
          frequency_days: data.frequency_days,
          max_notifications: data.max_notifications,
        })
        .eq('id', setting.id);

      if (error) throw error;
      
      toast.success("Notification setting updated successfully");
      onSuccess();
    } catch (err: any) {
      toast.error(`Failed to update notification setting: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded-lg shadow border">
      <h2 className="text-xl font-semibold">Edit Notification Setting</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Email only)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="delay_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delay (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    Days to wait before sending the notification
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
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    0 for one-time notification, or days between recurring notifications
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
                  <FormLabel>Max Notifications</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormDescription>
                    0 for unlimited, or the maximum number of times this notification will be sent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    className="min-h-[120px]" 
                    placeholder="Notification message content..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enabled</FormLabel>
                  <FormDescription>
                    Turn this notification on or off
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
