
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface PhoneVerificationProps {
  phoneCountryCode: string;
  phoneNumber: string;
  onVerificationSuccess: () => void;
  onPhoneChange: (field: string, value: string) => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  phoneCountryCode,
  phoneNumber,
  onVerificationSuccess,
  onPhoneChange,
}) => {
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const getFullPhoneNumber = () => {
    const code = phoneCountryCode.startsWith('+') 
      ? phoneCountryCode 
      : `+${phoneCountryCode}`;
    return `${code}${phoneNumber}`;
  };
  
  const sendVerificationCode = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    try {
      setIsSending(true);
      const { data, error } = await supabase.functions.invoke('phone-verification', {
        body: {
          action: 'send',
          phoneNumber: getFullPhoneNumber(),
        }
      });
      
      if (error) {
        console.error('Error sending verification code:', error);
        toast.error("Failed to send verification code");
        return;
      }
      
      if (data.success) {
        setCodeSent(true);
        toast.success("Verification code sent to your phone");
      } else {
        toast.error(data.error || "Failed to send verification code");
      }
    } catch (err) {
      console.error('Error in sendVerificationCode:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSending(false);
    }
  };
  
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      toast.error("Please enter the 4-digit verification code");
      return;
    }
    
    try {
      setIsVerifying(true);
      const { data, error } = await supabase.functions.invoke('phone-verification', {
        body: {
          action: 'verify',
          phoneNumber: getFullPhoneNumber(),
          code: verificationCode,
        }
      });
      
      if (error) {
        console.error('Error verifying code:', error);
        toast.error("Failed to verify code");
        return;
      }
      
      if (data.success && data.valid) {
        setIsVerified(true);
        toast.success("Phone number verified successfully");
        onVerificationSuccess();
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (err) {
      console.error('Error in verifyCode:', err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phoneNumber" className="flex items-center gap-2">
          <Phone className="h-4 w-4" /> Phone Number {isVerified && (
            <span className="ml-2 text-green-500 flex items-center">
              <Check className="h-4 w-4" /> Verified
            </span>
          )}
        </Label>
        <div className="flex gap-2">
          <Input
            id="phoneCountryCode"
            value={phoneCountryCode}
            onChange={(e) => onPhoneChange('phoneCountryCode', e.target.value)}
            className="w-20"
            disabled={isVerified}
          />
          <Input
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => onPhoneChange('phoneNumber', e.target.value)}
            placeholder="Phone number"
            className="flex-1"
            type="tel"
            disabled={isVerified}
          />
          {!codeSent && !isVerified && (
            <Button 
              onClick={sendVerificationCode} 
              disabled={!phoneNumber || isSending || isVerified}
            >
              {isSending ? "Sending..." : "Verify"}
            </Button>
          )}
        </div>
      </div>
      
      {codeSent && !isVerified && (
        <div className="space-y-2">
          <Label htmlFor="verificationCode">Enter the 4-digit verification code</Label>
          <div className="flex items-center gap-4">
            <InputOTP
              maxLength={4}
              value={verificationCode}
              onChange={setVerificationCode}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />
            <Button 
              onClick={verifyCode} 
              disabled={!verificationCode || verificationCode.length !== 4 || isVerifying}
            >
              {isVerifying ? "Verifying..." : "Submit"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
