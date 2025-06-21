import React from "react";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatorInvitation } from "@/types/invitation";

interface SubmissionCompleteScreenProps {
  showPasswordForm: boolean;
  passwordData: {
    password: string;
    confirmPassword: string;
  };
  submitting: boolean;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetPassword: () => void;
  onShowPasswordForm: () => void;
  invitation: CreatorInvitation;
}

export const SubmissionCompleteScreen: React.FC<
  SubmissionCompleteScreenProps
> = ({
  showPasswordForm,
  passwordData,
  submitting,
  onPasswordChange,
  onSetPassword,
  onShowPasswordForm,
  invitation,
}) => {
  return (
    <div className="pt-8 pb-8 flex flex-col items-center">
      <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-6 rounded-full mb-4">
        {showPasswordForm ? (
          <div className="text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        ) : (
          <Check className="h-12 w-12 text-white" />
        )}
      </div>

      {showPasswordForm ? (
        <>
          <CardTitle className="text-2xl font-bold text-center mb-2">
            Create Password
          </CardTitle>
          <p className="text-gray-600 text-center mb-6">
            Set a secure password for your creator account
          </p>

          <div className="w-full space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={passwordData.password}
                onChange={onPasswordChange}
              />
              <p className="text-sm text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={onPasswordChange}
              />
            </div>

            <Button
              onClick={onSetPassword}
              disabled={
                submitting ||
                passwordData.password.length < 8 ||
                passwordData.password !== passwordData.confirmPassword
              }
              className="w-full"
            >
              {submitting ? "Creating Account..." : "Set Password & Continue"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <CardTitle className="text-2xl font-bold text-center mb-2">
            Registration Completed!
          </CardTitle>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Congratulations! You’ve completed your application. Finish setting
            up your password to check your application status anytime and unlock
            exclusive opportunities with La Neta, like brand deals, webinars,
            and more.
          </p>
          <p className="text-gray-600 text-center mb-8">
            <Mail className="inline mr-2 text-blue-500" /> You'll receive a notification from Meta if you're accepted! Make sure you're logged into your Facebook app  so you don't miss out.
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
            onClick={onShowPasswordForm}
          >
            Set a Password
          </Button>
        </>
      )}
    </div>
  );
};
