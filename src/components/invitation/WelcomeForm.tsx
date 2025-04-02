import React from "react";
import { useNavigate } from "react-router-dom";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreatorInvitation } from "@/types/invitation";
import { AlertTriangle, Sparkles, Check } from "lucide-react";
import { TermsCheckbox } from "../terms-and-conditions/TermsAndConditions";

interface WelcomeFormProps {
  invitation: CreatorInvitation;
  formData: {
    fullName: string;
    email: string;
    socialMediaHandle: string;
    termsAccepted: boolean;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (checked: boolean) => void;
  onContinue: () => void;
  isSubmitting?: boolean;
}

export const WelcomeForm: React.FC<WelcomeFormProps> = ({
  invitation,
  formData,
  onInputChange,
  onCheckboxChange,
  onContinue,
  isSubmitting = false,
}) => {
  const handleContinue = () => {
    if (!formData.termsAccepted) {
      toast.error("You must accept the terms and conditions to continue");
      return;
    }
    onContinue();
  };

  return (
    <>
      <CardContent className="space-y-6">
        {/* Join Meta Creator Program Section (Moved from CardHeader) */}
        <div className="mt-4 border-gray-200 pt-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Join Meta Creator Program
          </h2>
          <p className="text-gray-600">
            You've been invited to join Meta's exclusive content creator program
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onInputChange}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              className="bg-gray-50"
              placeholder="your@email.com"
            />
          </div>

          {invitation.social_media_type && (
            <div className="space-y-2">
              <Label htmlFor="socialMediaHandle">
                {invitation.social_media_type === "tiktok"
                  ? "TikTok Username"
                  : "Pinterest Username"}
              </Label>
              <Input
                id="socialMediaHandle"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                readOnly
                className="bg-gray-50"
                placeholder={
                  invitation.social_media_type === "tiktok"
                    ? "@username"
                    : "username"
                }
              />
            </div>
          )}

          <TermsCheckbox
            formData={formData}
            onCheckboxChange={onCheckboxChange}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={!formData.termsAccepted || isSubmitting}
        >
          {isSubmitting ? "Processing..." : "Continue"}
        </Button>
      </CardFooter>

    </>
  );
};
