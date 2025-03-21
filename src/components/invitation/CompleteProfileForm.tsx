
import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Instagram, Youtube } from "lucide-react";
import { PhoneVerification } from "@/components/invitation/PhoneVerification";

interface CompleteProfileFormProps {
  onSubmit: (formData: ProfileFormData) => void;
  isSubmitting: boolean;
}

export interface ProfileFormData {
  youtubeChannel: string;
  instagramUser: string;
  phoneCountryCode: string;
  phoneNumber: string;
  isPhoneVerified: boolean;
}

export const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({ 
  onSubmit, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    youtubeChannel: "",
    instagramUser: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
    isPhoneVerified: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePhoneChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleVerificationSuccess = () => {
    setFormData({
      ...formData,
      isPhoneVerified: true
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtubeChannel" className="flex items-center gap-2">
              <Youtube className="h-4 w-4" /> YouTube Channel (Optional)
            </Label>
            <Input
              id="youtubeChannel"
              name="youtubeChannel"
              value={formData.youtubeChannel}
              onChange={handleInputChange}
              placeholder="@channelname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagramUser" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" /> Instagram (Optional)
            </Label>
            <Input
              id="instagramUser"
              name="instagramUser"
              value={formData.instagramUser}
              onChange={handleInputChange}
              placeholder="@username"
            />
          </div>

          <PhoneVerification
            phoneCountryCode={formData.phoneCountryCode}
            phoneNumber={formData.phoneNumber}
            onVerificationSuccess={handleVerificationSuccess}
            onPhoneChange={handlePhoneChange}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !formData.phoneNumber || !formData.isPhoneVerified}
        >
          {isSubmitting ? "Saving..." : "Complete Registration"}
        </Button>
      </CardFooter>
    </>
  );
};
