
import { sendCreatorInvitationEmail } from "@/services/invitation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendInvitationEmail = () => {
  return useMutation({
    mutationFn: ({
      email,
      name,
      invitationUrl,
    }: {
      email: string;
      name?: string;
      invitationUrl: string;
    }) => sendCreatorInvitationEmail({ email, name, invitationUrl }),

    onSuccess: () => {
      toast.success("Invitation email sent successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error sending email: ${error.message}`);
    },
  });
};
