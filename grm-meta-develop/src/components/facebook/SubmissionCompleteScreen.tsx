import React from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { CreatorInvitation } from "@/types/invitation";
import { sendMagicLink } from "@/utils/sendMagicLink";
import { toast } from "sonner";

interface SubmissionCompleteScreenProps {
  invitation: CreatorInvitation;
}

export const SubmissionCompleteScreen: React.FC<
  SubmissionCompleteScreenProps
> = ({ invitation }) => {
  return (
    <div className="pt-8 pb-8 flex flex-col items-center">
      <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-6 rounded-full mb-4">
        <Check className="h-12 w-12 text-white" />
      </div>
      <CardTitle className="text-2xl font-bold text-center mb-2">
        Registration Completed!
      </CardTitle>
      <p className="text-gray-600 text-center mb-4 text-sm">
        Congratulations! You’ve completed your application. Finish setting up
        your password to check your application status anytime and unlock
        exclusive opportunities with La Neta, like brand deals, webinars, and
        more.
      </p>
      <p className="text-gray-600 text-center mb-8">
        <Mail className="inline mr-2 text-blue-500" /> You'll receive a
        notification from Meta if you're accepted! Make sure you're logged into
        your Facebook app so you don't miss out.
      </p>
      <div className="bg-indigo-50 rounded-xl p-6 mb-8 text-center">
        <h2>Your Registration Numbers</h2>
        <p className="text-5xl font-bold tracking-wider font-mono bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
          {invitation.invitation_code}
        </p>
        <p className="text-sm text-gray-500">
          Please save this number for your records.
        </p>
      </div>
      <Button
        className="w-fit h-12 bg-[linear-gradient(to_right,_#4776E6_0%,_#8E54E9_100%)] hover:opacity-90 text-white font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={async () => {
          const isEmailSent = await sendMagicLink(invitation.email);

          if (isEmailSent) {
            toast.success(
              "Your magic link was sent. Check your email to sign in."
            );
          }
        }}
      >
        Resend Login Email
      </Button>

      {invitation.email && (
        <p className="mt-2 text-sm text-gray-500 text-center max-w-xs">
          Didn’t receive an email? Click the button above to resend your magic
          link to <span className="font-medium">{invitation.email}</span>.
        </p>
      )}
    </div>
  );
};
