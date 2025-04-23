
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

interface PhoneInputProps {
  phoneCountryCode: string;
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  readOnlyCode?: boolean;
}

export const PhoneValidate: React.FC<PhoneInputProps> = ({
  phoneCountryCode,
  phoneNumber,
  onPhoneChange,
  readOnlyCode = true,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber" className="flex items-center gap-2">
        <Phone className="h-4 w-4" /> Número de Teléfono
      </Label>
      <div className="flex gap-2">
        <Input
          value={phoneCountryCode || "+52"} 
          readOnly={readOnlyCode}
          className="w-20 bg-gray-50 border-pink-100"
        />
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Tu número de teléfono"
          className="flex-1 border-pink-100 focus-visible:ring-pink-200"
          type="tel"
        />
      </div>
    </div>
  );
};
