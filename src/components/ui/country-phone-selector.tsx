
import * as React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCountryPhoneCodes } from "@/hooks/useCountryPhoneCodes";

interface CountryPhoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CountryPhoneSelector({ value, onChange }: CountryPhoneSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { countries, loading } = useCountryPhoneCodes(search);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Seleccionar país"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar país..." 
            onValueChange={setSearch}
          />
          <CommandEmpty>No se encontraron países.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {countries.map((country) => (
              <CommandItem
                key={country.id}
                value={country.name_es}
                onSelect={() => {
                  onChange(country.phone_code);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === country.phone_code ? "opacity-100" : "opacity-0"
                  )}
                />
                {country.name_es} ({country.phone_code})
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
