import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  countries: Country[]; // Nueva prop para recibir la lista de países
}

export const CountrySelect = ({
  onSelect,
  value,
  className,
  placeholder,
  countries, // Recibimos los países como prop
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();

  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);

  useEffect(() => {
    setFilteredCountries(
      countries.filter((country) =>
        country.name_es.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, countries]);

  const currentCountry = filteredCountries.find((country) => country.id === value);
  const loadingMessage = null;
  const errorMessage = null;
  const emptyMessage = !loadingMessage && !errorMessage && filteredCountries.length === 0
    ? "No countries found"
    : null;

    if (isMobile) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              role="combobox"
              aria-expanded={open}
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
              )}
            >
              {currentCountry ? `${currentCountry.name_es}` : placeholder || "Select country"}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-screen p-0" align="start" sideOffset={0}>
            <Command className="w-full">
              {/* <CommandInput
                placeholder="Buscar país..."
                value={search}
                onValueChange={setSearch}
                className="h-9"
                autoFocus={true}
              /> */}
              <CommandList className="max-h-[300px] overflow-y-auto">
                {loadingMessage && <CommandEmpty>{loadingMessage}</CommandEmpty>}
                {errorMessage && <CommandEmpty>{errorMessage}</CommandEmpty>}
                {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
                {!loadingMessage && !errorMessage && !emptyMessage && (
                  <CommandGroup>
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.id}
                        onSelect={() => {
                          onSelect(country.id, country.phone_code);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === country.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.name_es}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

  return (
    <Select
      value={value}
      onValueChange={(countryId) => {
        const country = countries.find((c) => c.id === countryId);
        if (country) {
          onSelect(countryId, country.phone_code);
        }
      }}
    >
      <SelectTrigger className={className} disabled={false}> 
        <SelectValue placeholder={placeholder || "Select country"} />
      </SelectTrigger>
      <SelectContent>
        <Command>
          {/* <CommandInput
            placeholder="Buscar país..."
            value={search}
            onValueChange={setSearch}
            className="h-9"
            autoFocus={true}
          /> */}
          <CommandList>
            {loadingMessage && <CommandEmpty>{loadingMessage}</CommandEmpty>}
            {errorMessage && <CommandEmpty>{errorMessage}</CommandEmpty>}
            {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            {!loadingMessage && !errorMessage && !emptyMessage && (
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name_es} 
                  </SelectItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </SelectContent>
    </Select>
  );
};