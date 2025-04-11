import React from "react";
import { WelcomeFormYoutube } from "@/components/invitation/WelcomFormYouTube";
import { CompleteProfileFormYtb } from "@/components/invitation/CompleteProfileFormYtb";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";

export const YouTubeForm = ({
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
  handleCompleteProfileSubmit,
  handleFacebookInputChange,
  handleCheckboxFacebookChange,
  handleFacebookSubmit,
  handlePasswordChange,
  handleSetPassword,
  setShowPasswordForm,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  return (
    <>
      {currentStep.id === "welcome" && (
        <WelcomeFormYoutube
          invitation={invitation}
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onContinue={handleContinueWelcome}
          isSubmitting={isSubmitting}
        />
      )}
      {currentStep.id === "completeProfile" && (
        <CompleteProfileFormYtb
          onSubmit={handleCompleteProfileSubmit}
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