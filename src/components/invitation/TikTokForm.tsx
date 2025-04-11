import React from "react";
import { WelcomeForm } from "@/components/invitation/WelcomeForm";
import { CompleteProfileForm } from "@/components/invitation/CompleteProfileForm";
import { FacebookPageForm } from "@/components/facebook/FacebookPageForm";
import { SubmissionCompleteScreen } from "@/components/facebook/SubmissionCompleteScreen";

export const TikTokForm = ({
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
        <WelcomeForm
          invitation={invitation}
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onContinue={handleContinueWelcome}
          isSubmitting={isSubmitting}
        />
      )}
      {currentStep.id === "completeProfile" && (
        <CompleteProfileForm
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