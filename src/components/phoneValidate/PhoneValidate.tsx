import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface PhoneInputProps {
  countries: { country_id: string; countries: { name_es: string; phone_code: string } }[];
  selectedPhoneCode: string;
  onPhoneCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
}

export const PhoneValidate: React.FC<PhoneInputProps> = ({
  countries,
  selectedPhoneCode,
  onPhoneCodeChange,
  phoneNumber,
  onPhoneNumberChange,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="phoneNumber" className="flex items-center gap-2">
        <Phone className="h-4 w-4" /> Número de Teléfono
      </Label>
      <div className="flex gap-2">
        <Select value={selectedPhoneCode} onValueChange={onPhoneCodeChange}>
          <SelectTrigger className="w-20 border border-pink-100 rounded-md px-2 py-1.5 text-black focus:outline-none focus:ring-0 focus:border-pink-500">
            <SelectValue placeholder="codigo" />
          </SelectTrigger>
          <SelectContent className="bg-white rounded-md shadow-lg mt-1 w-full max-h-40 overflow-y-auto">
            {countries.map((country) => (
              <SelectItem
                key={country.country_id}
                value={`+${country.countries.phone_code}`}
                className="px-4 py-2 text-black pl-7  hover:bg-pink-200"
              >
                +{country.countries.phone_code} ({country.countries.name_es})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value.replace(/\D/g, ""))}
          placeholder="Tu número de teléfono"
          className="flex-1 border-pink-100 focus-visible:ring-pink-200"
          type="tel"
        />
      </div>
    </div>
  );
};