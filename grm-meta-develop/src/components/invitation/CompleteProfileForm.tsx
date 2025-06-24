import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Shield } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInputBeforeUpdate } from "@/utils/sanitizeInputBeforeUpdate";
import { CreatorInvitation } from "@/types/invitation";
import { ProfileFormData } from "@/types/forms-type";

interface CompleteProfileFormProps {
  onSubmit: (formData: ProfileFormData) => void;
  isSubmitting: boolean;
  invitation: CreatorInvitation;
}

export const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({
  onSubmit,
  isSubmitting,
  invitation,
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    youtubeChannel: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    phoneVerified: false,
  });

  const [verificationStep, setVerificationStep] = useState<
    "input" | "verification"
  >("input");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      youtubeChannel: invitation.youtube_channel,
      phoneCountryCode: invitation.phone_country_code ?? "+1",
      phoneNumber: invitation.phone_number,
      phoneVerified: invitation.phone_verified,
    });
  }, [invitation]);

  // Handle countdown timer for OTP expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Format countdown as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For phone numbers, only allow digits
    if (name === "phoneNumber") {
      setFormData({
        ...formData,
        [name]: value.replace(/\D/g, ""),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSendVerificationCode = async () => {
    // Validation
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "send",
          phoneNumber: formData.phoneNumber,
          countryCode: formData.phoneCountryCode ?? "+1",
        },
      });

      if (error) {
        console.error("Error sending verification code:", error);
        setError(error.message ?? "Failed to send verification code");
        toast.error("Failed to send verification code");
        return;
      }

      if (data.success) {
        toast.success("Verification code sent to your phone");
        setVerificationStep("verification");
        setCountdown(600); // 10-minute countdown (Twilio default)
      } else {
        setError(data.message ?? "Failed to send verification code");
        toast.error(data.message ?? "Failed to send verification code");
      }
    } catch (err) {
      console.error("Error in verification process:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }

    try {
      setIsVerifying(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("verify-phone", {
        body: {
          action: "verify",
          phoneNumber: formData.phoneNumber,
          countryCode: formData.phoneCountryCode,
          verificationCode,
          invitationId: invitation.id,
        },
      });

      if (error) {
        console.error("Error verifying code:", error);
        setError(error.message ?? "Failed to verify code");
        toast.error("Failed to verify code");
        return;
      }

      if (data.success) {
        toast.success("Phone verified successfully");
        setFormData({
          ...formData,
          phoneVerified: true,
        });
        setVerificationStep("input");
      } else {
        setError(data.message ?? "Invalid verification code");
        toast.error(data.message ?? "Invalid verification code");
      }
    } catch (err) {
      console.error("Error in verification process:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = () => {
    setVerificationCode("");
    handleSendVerificationCode();
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          {/* Campo requerido: Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number <span className="text-red-500">*</span>
              {formData.phoneVerified && (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified
                </span>
              )}
            </Label>

            {/* Teléfono con verificación */}
            {verificationStep === "input" ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="phoneCountryCode"
                    name="phoneCountryCode"
                    value={formData.phoneCountryCode}
                    onChange={handleInputChange}
                    className="w-20 bg-gray-50 border-0"
                    readOnly={true}
                    aria-readonly={formData.phoneVerified}
                  />
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="flex-1 bg-gray-50 border-0"
                    type="tel"
                    readOnly={formData.phoneVerified}
                    disabled={formData.phoneVerified}
                    aria-readonly={formData.phoneVerified}
                  />
                </div>

                {!formData.phoneVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={
                      isVerifying ||
                      !formData.phoneNumber ||
                      formData.phoneNumber.length < 10
                    }
                    className="mt-1"
                  >
                    {isVerifying ? "Sending..." : "Verify Phone Number"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Verification Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verification-code">
                    Enter the 4-digit verification code
                  </Label>
                  <div className="flex justify-center py-4">
                    <InputOTP
                      maxLength={4}
                      value={verificationCode}
                      onChange={setVerificationCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="text-sm text-center space-y-2">
                    <p className="text-muted-foreground">
                      We sent a code to {formData.phoneCountryCode}-
                      {formData.phoneNumber}
                    </p>
                    {countdown > 0 && (
                      <p className="text-muted-foreground">
                        Code expires in:{" "}
                        <span className="font-medium">
                          {formatTime(countdown)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setVerificationStep("input");
                      setVerificationCode("");
                      setCountdown(0);
                    }}
                  >
                    Back
                  </Button>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendCode}
                      disabled={isVerifying || countdown > 540}
                    >
                      Resend Code
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 4 || isVerifying}
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Campo opcional: YouTube */}
          <div className="space-y-2">
            <Label htmlFor="youtubeChannel">YouTube Channel (Optional)</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-0 rounded-l-md">
                @
              </span>
              <Input
                id="youtubeChannel"
                name="youtubeChannel"
                value={formData.youtubeChannel}
                onChange={(e) => {
                  const sanitizedValue = sanitizeInputBeforeUpdate(
                    e.target.value
                  );
                  setFormData((prev) => ({
                    ...prev,
                    youtubeChannel: sanitizedValue,
                  }));
                }}
                placeholder="channelname"
                className="rounded-l-none bg-gray-50 border-0"
              />
            </div>
            <p className="text-xs text-gray-500">
              Link your YouTube channel to unlock cross-platform opportunities
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button
          onClick={handleSubmit}
          className="w-fit h-12 bg-[linear-gradient(to_right,_#4776E6_0%,_#8E54E9_100%)] hover:opacity-90 text-white font-medium rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={
            isSubmitting ||
            !formData.phoneVerified ||
            !formData.phoneNumber
          }
        >
          {isSubmitting ? "Saving..." : "Continue to final step"}
        </Button>
      </CardFooter>
    </>
  );
};
