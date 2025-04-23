
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Country {
  id: string;
  name_es: string;
  phone_code: string;
}

interface CountrySelectProps {
  onSelect: (countryId: string, phoneCode: string) => void;
  value?: string;
  className?: string;
  placeholder?: string;
}

export const CountrySelect = ({ onSelect, value, className, placeholder }: CountrySelectProps) => {
  const [countries, setCountries] = useState<Country[]>([]);

  // Fetch countries when the select is opened
  const handleOpen = async () => {
    if (countries.length > 0) return;

    const { data, error } = await supabase.rpc('search_countries', { 
      search_term: '' 
    });

    if (!error && data) {
      setCountries(data);
    }
  };

  return (
    <Select
      value={value}
      onValueChange={(countryId) => {
        const country = countries.find(c => c.id === countryId);
        if (country) {
          onSelect(countryId, country.phone_code);
        }
      }}
      onOpenChange={(open) => {
        if (open) handleOpen();
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder || "Seleccionar país"} />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.id} value={country.id}>
            {country.name_es} (+{country.phone_code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
