import React from "react";
import { Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}) => {
  return (
    <div className="pt-8 pb-8 flex flex-col items-center">
      <div className="bg-blue-100 p-6 rounded-full mb-4">
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
          <Eye className="h-12 w-12 text-blue-600" />
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
            Your Submission is Under Review!
          </CardTitle>
          <p className="text-gray-600 text-center mb-4 text-sm">
            Congrats! Our team is now validating your info (3–7 business days).
            Finish setting your password now to access your account and track
            your application status anytime
          </p>
          <p className="text-gray-600 text-center mb-8">
            <Mail className="inline mr-2 text-blue-500" /> You'll be notified
            via email/SMS once approved.
          </p>

          <Button onClick={onShowPasswordForm}>Set a Password</Button>
        </>
      )}
    </div>
  );
};
