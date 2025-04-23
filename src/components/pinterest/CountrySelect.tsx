
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries, Country } from "@/hooks/useCountries";

interface CountrySelectProps {
  onSelect: (countryId: string, phoneCode: string) => void;
  value?: string;
  className?: string;
  placeholder?: string;
}

export const CountrySelect = ({ onSelect, value, className, placeholder }: CountrySelectProps) => {
  const { data: countries = [], isLoading, error } = useCountries();
  
  if (error) {
    console.error("Error in CountrySelect:", error);
  }

  return (
    <Select
      value={value}
      onValueChange={(countryId) => {
        const country = countries.find(c => c.id === countryId);
        if (country) {
          onSelect(countryId, country.phone_code);
        }
      }}
    >
      <SelectTrigger className={className} disabled={isLoading}>
        <SelectValue placeholder={isLoading ? "Cargando..." : (placeholder || "Seleccionar país")} />
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
