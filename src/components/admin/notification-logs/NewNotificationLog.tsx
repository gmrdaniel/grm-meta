
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/auth/LoadingSpinner";
import { Form } from "@/components/ui/form";
import { RecipientField } from "./components/RecipientField";
import { ChannelField } from "./components/ChannelField";
import { NotificationSettingField } from "./components/NotificationSettingField";
import { ProjectStageField } from "./components/ProjectStageField";
import { StatusField } from "./components/StatusField";
import { ErrorMessageField } from "./components/ErrorMessageField";
import { notificationLogFormSchema, NotificationLogFormValues } from "./schemas/notificationLogFormSchema";
import { createNotificationLog } from "./services/createNotificationLog";

export function NewNotificationLog({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form setup
  const form = useForm<NotificationLogFormValues>({
    resolver: zodResolver(notificationLogFormSchema),
    defaultValues: {
      status: "pending",
      channel: "email",
    },
  });

  // Form submission handler
  const onSubmit = async (values: NotificationLogFormValues) => {
    setIsSubmitting(true);
    try {
      await createNotificationLog(values);
      
      toast.success("Notification log created successfully");
      form.reset();
      if (onSuccess) onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Error creating notification log: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchStatus = form.watch("status");

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4">Create New Notification Log</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecipientField control={form.control} />
              <ChannelField control={form.control} />
              <NotificationSettingField control={form.control} />
              <ProjectStageField control={form.control} />
              <StatusField control={form.control} />

              {watchStatus === "failed" && (
                <ErrorMessageField control={form.control} />
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