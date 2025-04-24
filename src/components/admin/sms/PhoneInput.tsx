
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CountrySelect } from "@/components/pinterest/CountrySelect";

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
  return (
    <>
      <div>
        <Label htmlFor="country">Código de país</Label>
        <CountrySelect
          onSelect={(_countryId: string, code: string) => onPhoneCodeChange(code)}
          className="w-full"
          placeholder="Seleccionar país"
        />
      </div>

      <div>
        <Label htmlFor="phone">Número de teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="123456789"
          required
        />
      </div>
    </>
  );
}
