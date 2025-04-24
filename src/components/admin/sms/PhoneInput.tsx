
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/pinterest/CountrySelect";
import { useState } from "react";

interface PhoneInputProps {
  phoneCode: string;
  phoneNumber: string;
  onPhoneCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
}

export function PhoneInput({ 
  phoneCode, 
  phoneNumber, 
  onPhoneCodeChange, 
  onPhoneNumberChange 
}: PhoneInputProps) {
  const [error, setError] = useState<string | null>(null);

  const handlePhoneNumberChange = (value: string) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Validate that only numbers are entered
    if (numericValue === value) {
      setError(null);
      onPhoneNumberChange(numericValue);
    } else {
      setError("Phone number must contain only digits");
    }
  };

  return (
    <>
      <div>
        <Label htmlFor="country">Country code</Label>
        <CountrySelect
          onSelect={(_countryId: string, code: string) => onPhoneCodeChange(code)}
          className="w-full"
          placeholder="Select country"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder="123456789"
          required
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </>
  );
}

