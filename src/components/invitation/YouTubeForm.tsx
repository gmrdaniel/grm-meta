
import React from "react";
import { WelcomeFormYoutube } from "@/components/invitation/WelcomFormYouTube";
import { CompleteProfileFormYtb } from "@/components/invitation/CompleteProfileFormYtb";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";

interface YouTubeFormProps {
  currentStep: any;
  invitation: any;
  formData: any;
  saving: boolean;
  isSubmitting: boolean;
  submissionComplete: boolean;
  facebookFormData: any;
  submitting: boolean;
  error: any;
  showPasswordForm: boolean;
  passwordData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (checked: boolean) => void;
  handleContinueWelcome: () => void;
  handleCompleteProfileYtbSubmit: (data: any) => void;
  handleFacebookInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxFacebookChange: (checked: boolean) => void;
  handleFacebookSubmit: (e: React.FormEvent) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetPassword: () => void;
  setShowPasswordForm: (show: boolean) => void;
}

export const YouTubeForm: React.FC<YouTubeFormProps> = ({
  currentStep,
  invitation,
  formData,
  saving,
  isSubmitting,
  submissionComplete,
  facebookFormData,
  submitting,
  error,
  showPasswordForm,
  passwordData,
  handleInputChange,
  handleCheckboxChange,
  handleContinueWelcome,
  handleCompleteProfileYtbSubmit,
  handleFacebookInputChange,
  handleCheckboxFacebookChange,
  handleFacebookSubmit,
  handlePasswordChange,
  handleSetPassword,
  setShowPasswordForm,
}) => {
  return (
    <>
      {currentStep.id === "welcome" && (
        <WelcomeFormYoutube />
      )}
      {currentStep.id === "completeProfile" && (
        <CompleteProfileFormYtb
          onSubmit={handleCompleteProfileYtbSubmit}
          isSubmitting={saving}
          invitation={invitation}
        />
      )}
      {currentStep.id === "fbcreation" &&
        (submissionComplete || invitation.fb_step_completed) && (
          <SubmissionCompleteScreen
            showPasswordForm={showPasswordForm}
            passwordData={passwordData}
            submitting={submitting}
            onPasswordChange={handlePasswordChange}
            onSetPassword={handleSetPassword}
            onShowPasswordForm={() => setShowPasswordForm(true)}
          />
        )}
      {currentStep.id === "fbcreation" &&
        !submissionComplete &&
        !invitation.fb_step_completed && (
          <FacebookPageForm
            formData={facebookFormData}
            submitting={submitting}
            error={error}
            onInputChange={handleFacebookInputChange}
            onCheckboxChange={handleCheckboxFacebookChange}
            onSubmit={handleFacebookSubmit}
          />
        )}
    </>
  );
};
