
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
      {/* Welcome Banner */}
      <div className="bg-blue-50 p-4 rounded-t-lg border border-blue-100">
        <div className="flex items-center gap-2 text-blue-600 text-xl font-medium mb-2">
          <Sparkles className="h-5 w-5" />
          <span>Welcome, Creator!</span>
        </div>
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Limited spots available!</span>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="p-4 border-x border-b border-gray-200">
        <h3 className="font-medium mb-3">Benefits:</h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>$5,000 Bonuses (90 days)</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>Immediate Facebook Monetization</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>Free Meta Verified</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>Priority Reach & Insights</span>
          </li>
          <li className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <span>Paid Brand Sponsorships</span>
          </li>
        </ul>
        

      </div>

      <CardContent className="space-y-6">
        {/* Join Meta Creator Program Section (Moved from CardHeader) */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <h2 className="text-2xl font-bold text-gray-800">Join Meta Creator Program</h2>
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
              onChange={onInputChange}
              placeholder="your@email.com"
            />
          </div>

          {invitation.social_media_type && (
            <div className="space-y-2">
              <Label htmlFor="socialMediaHandle">
                {invitation.social_media_type === 'tiktok' ? 'TikTok Username' : 'Pinterest Username'}
              </Label>
              <Input
                id="socialMediaHandle"
                name="socialMediaHandle"
                value={formData.socialMediaHandle}
                onChange={onInputChange}
                placeholder={invitation.social_media_type === 'tiktok' ? '@username' : 'username'}
              />
            </div>
          )}

          <div className="flex items-center space-x-2 pt-4">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={onCheckboxChange}
            />
            <label
              htmlFor="termsAccepted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
            </label>
          </div>
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
