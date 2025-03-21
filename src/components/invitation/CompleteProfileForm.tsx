
import React, { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Instagram } from "lucide-react";

interface CompleteProfileFormProps {
  onSubmit: (formData: ProfileFormData) => void;
  isSubmitting: boolean;
}

export interface ProfileFormData {
  youtubeChannel: string;
  instagramUser: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

export const CompleteProfileForm: React.FC<CompleteProfileFormProps> = ({ 
  onSubmit, 
  isSubmitting 
}) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    youtubeChannel: "",
    instagramUser: "",
    phoneCountryCode: "+1",
    phoneNumber: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
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
            <Label htmlFor="youtubeChannel">YouTube Channel (Optional)</Label>
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

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="phoneCountryCode"
                name="phoneCountryCode"
                value={formData.phoneCountryCode}
                onChange={handleInputChange}
                className="w-20"
              />
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Phone number"
                className="flex-1"
                type="tel"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !formData.phoneNumber}
        >
          {isSubmitting ? "Saving..." : "Complete Registration"}
        </Button>
      </CardFooter>
    </>
  );
};
