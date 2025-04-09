
import { z } from "zod";

// Define the form schema using zod
export const notificationLogFormSchema = z.object({
  invitation_id: z.string().uuid({ message: "Please select a recipient" }),
  notification_setting_id: z.string().uuid({ message: "Please select a notification setting" }),
  stage_id: z.string().uuid({ message: "Please select a stage" }).optional(),
  channel: z.enum(["email", "sms"], { required_error: "Please select a channel" }),
  status: z.enum(["sent", "failed", "pending"], { required_error: "Please select a status" }),
  error_message: z.string().optional(),
});

export type NotificationLogFormValues = z.infer<typeof notificationLogFormSchema>;
