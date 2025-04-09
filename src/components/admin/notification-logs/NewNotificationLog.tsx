
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Define the form schema using zod
const formSchema = z.object({
  invitation_id: z.string().uuid({ message: "Please select a recipient" }),
  notification_setting_id: z.string().uuid({ message: "Please select a notification setting" }),
  stage_id: z.string().uuid({ message: "Please select a stage" }).optional(),
  channel: z.enum(["email", "sms"], { required_error: "Please select a channel" }),
  status: z.enum(["sent", "failed", "pending"], { required_error: "Please select a status" }),
  error_message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Invitation = {
  id: string;
  email: string;
  full_name: string;
};

type NotificationSetting = {
  id: string;
  type: string;
  message: string;
  channel: "email" | "sms";
};

type ProjectStage = {
  id: string;
  name: string;
  project_id: string;
};

export function NewNotificationLog({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      channel: "email",
    },
  });

  // Fetch invitations for dropdown
  const { data: invitations, isLoading: loadingInvitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("creator_invitations")
        .select("id, email, full_name")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Invitation[];
    },
  });

  // Fetch notification settings for dropdown
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["notification-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("id, type, message, channel")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as NotificationSetting[];
    },
  });

  // Fetch project stages for dropdown
  const { data: stages, isLoading: loadingStages } = useQuery({
    queryKey: ["project-stages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stages")
        .select("id, name, project_id")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as ProjectStage[];
    },
  });

  // Handle channel change to filter notification settings
  const filteredSettings = settings?.filter(setting => 
    form.watch("channel") ? setting.channel === form.watch("channel") : true
  );

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("notification_logs")
        .insert({
          invitation_id: values.invitation_id,
          notification_setting_id: values.notification_setting_id,
          stage_id: values.stage_id,
          channel: values.channel,
          status: values.status,
          error_message: values.error_message || null,
        });

      if (error) throw error;
      
      toast.success("Notification log created successfully");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(`Error creating notification log: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInvitations || loadingSettings || loadingStages) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Create New Notification Log</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="invitation_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a recipient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invitations?.map((invitation) => (
                          <SelectItem key={invitation.id} value={invitation.id}>
                            {invitation.full_name} ({invitation.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <FormField
                control={form.control}
                name="notification_setting_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Setting</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a notification setting" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSettings?.map((setting) => (
                          <SelectItem key={setting.id} value={setting.id}>
                            {setting.type} ({setting.message.substring(0, 30)}...)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Stage (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stages?.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("status") === "failed" && (
                <FormField
                  control={form.control}
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
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <LoadingSpinner /> : "Create Notification Log"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
